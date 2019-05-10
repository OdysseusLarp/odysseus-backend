import { saveBlob, interval, schedule } from '../helpers';
import store, { watch } from '../../store/store';
import * as dmx from '../../dmx';
import { logger } from '../../logger';
import { pick, get } from 'lodash';
import { Ship, Grid, GridAction } from '../../models/ship';
import { shipLogger } from '../../models/log';
import { MapObject } from '../../models/map-object';

// Jump drive state spec:
// https://docs.google.com/presentation/d/1nbXQE9N10Zm7uS45eW4R1VvYU4zZQ0PZbRovUq7bA5o/edit#slide=id.g4d32841109_0_0

const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;
const SEC = 1000;

export const COOLDOWN_LIMIT = 2 * HOUR + 15 * MIN + 43 * SEC;
export const SAFE_JUMP_LIMIT = 2 * HOUR + 47 * MIN;
export const BREAKING_JUMP_TIME = 5 * MIN;
const COUNTDOWN = 1 * MIN;

function setJumpUiEnabled(value = true) {
	const shipMetadata = store.getState().data.ship.metadata;
	saveBlob({
		...shipMetadata,
		jump_ui_enabled: value
	});
}

/**
 * Jumps the ship to a new grid by setting grid_id of the ship
 * @param {object} coordinates Target coordinates from jump state
 */
async function performShipJump(coordinates) {
	// Hard coded ship ID at this point, we are not going to jump other ships than Odysseus
	// TODO: Figure out a process for moving rest of the fleet around
	const shipId = 'odysseus';
	const jumpTargetParameters = pick(coordinates, ['sub_quadrant', 'sector', 'sub_sector']);
	const targetPlanetName = get(coordinates, 'planet_orbit');
	const promises = [
		Ship.forge({ id: shipId }).fetch(),
		Grid.forge().where(jumpTargetParameters).fetch()
	];
	if (targetPlanetName) promises.push(MapObject.forge().where({ name_generated: targetPlanetName }).fetch());
	const [ship, grid, targetPlanet] = await Promise.all(promises);
	let targetGeometry;
	if (targetPlanet) targetGeometry = targetPlanet.get('the_geom');
	else targetGeometry = await grid.getCenter();
	const gridId = grid ? grid.get('id') : null;
	if (!targetGeometry) logger.error('Could not calculate new geometry for ship when jumping to grid', gridId);
	// Reset jump range back to 1
	const metadata = { ...ship.get('metadata', {}), jump_range: 1 };
	await Promise.all([
		ship.save({ grid_id: gridId, metadata, the_geom: targetGeometry }),
		GridAction.forge().save({ grid_id: gridId, ship_id: shipId, type: 'JUMP' })
	]);
	logger.success(`${shipId} performed jumped to grid ${gridId}`);
}

function getReadableJumpTarget(coordinates) {
	const { sub_quadrant, sub_sector, sector } = pick(coordinates, ['sub_quadrant', 'sector', 'sub_sector']);
	const targetPlanetName = get(coordinates, 'planet_orbit');
	const gridName = `${sub_quadrant}-${sector}-${sub_sector}`;
	return targetPlanetName ? `${gridName} (orbit ${targetPlanetName})` : gridName;
}

function handleTransition(jump, currentStatus, previousStatus) {
	logger.info(`Jump drive transition ${previousStatus} -> ${currentStatus}`);
	const lastJump = jump.last_jump || Date.now();
	switch (`${previousStatus}>${currentStatus}`) {
		case 'jumping>broken':
			// FIXME: Add broken tasks
			// fall through
		case 'jumping>cooldown':
			if (jump.breaking_jump) {
				dmx.fireEvent(dmx.CHANNELS.JumpEndBreaking);
			} else {
				dmx.fireEvent(dmx.CHANNELS.JumpEnd);
			}
			// FIXME: Turn on necessary power sockets (unless done by tekniikkatiimi)
			logger.info(`Updating jump drive times`);
			saveBlob({
				...jump,
				last_jump: lastJump,
				jump_at: 0,
				breaking_jump: true,
			});
			// Actually perform the jump and hope that the async stuff works nicely here
			performShipJump(jump.coordinates).then(() => {
				const jumpTarget = getReadableJumpTarget(jump.coordinates);
				shipLogger.success(`Odysseus completed the jump to grid ${jumpTarget}.`);
			});
			setJumpUiEnabled(true);
			break;

		case 'broken>cooldown':
			dmx.fireEvent(dmx.CHANNELS.JumpFixed);
			break;

		case 'cooldown>ready_to_prep':
			dmx.fireEvent(dmx.CHANNELS.JumpPrepReady);
			shipLogger.info(`Jump drive is ready for jump preparations`);
			break;

		case 'ready_to_prep>calculating': {
			dmx.fireEvent(dmx.CHANNELS.JumpPrepStart);
			const jumpTarget = getReadableJumpTarget(jump.coordinates);
			shipLogger.info(`Calculating jump coordinates to target ${jumpTarget}.`);
			break;
		}

		case 'calculating>ready_to_prep':
			dmx.fireEvent(dmx.CHANNELS.JumpRejected);
			shipLogger.error(`Failed to calculate jump coordinates`);
			break;

		case 'preparation>ready_to_prep':
		case 'prep_complete>ready_to_prep':
		case 'ready>ready_to_prep':
			dmx.fireEvent(dmx.CHANNELS.JumpRejected);
			shipLogger.warning(`Jump process was cancelled`);
			break;

		case 'calculating>preparation':
			dmx.fireEvent(dmx.CHANNELS.JumpApproved);
			logger.info(`Initializing jump drive tasks`);
			shipLogger.success(`Jump coordinates have been calculated`);
			// FIXME: Add tasks for engineers
			break;

		case 'preparation>prep_complete':
			dmx.fireEvent(dmx.CHANNELS.JumpPrepEnd);
			shipLogger.success(`Jump drive preparations have been completed`);
			break;

		case 'prep_complete>ready':
			dmx.fireEvent(dmx.CHANNELS.JumpReady);
			shipLogger.success(`Jump drive is ready for jump`);
			break;

		case 'jump_initiated>prep_complete':
			// Admin aborted jump, reset jump_at + breaking_jump states
			dmx.fireEvent(dmx.CHANNELS.JumpAbort);
			saveBlob({
				...jump,
				jump_at: 0,
				breaking_jump: true,
			});
			break;

		case 'prep_complete>jump_initiated':
		case 'ready>jump_initiated':
			// Handled below in if-statement
			break;

		case 'jump_initiated>jumping': {
			// Disable Jump UI for the duration of the jump
			setJumpUiEnabled(false);
			const jumpTarget = getReadableJumpTarget(jump.coordinates);
			shipLogger.info(`Jumping to coordinates ${jumpTarget}.`);
			dmx.fireEvent(dmx.CHANNELS.JumpStart);
			// FIXME: Turn off necessary power sockets (unless done by tekniikkatiimi)
			break;
		}

		default:
			logger.error(`Invalid jump drive transition from '${previousStatus}' to '${currentStatus}'`);
			break;
	}

	// Rules run always, regardless of previousStatus

	if (currentStatus === 'jump_initiated') {
		const jumpAt = Date.now() + COUNTDOWN;
		logger.info(`Setting jump drive jump_at to ${jumpAt} (${new Date(jumpAt)})`);
		saveBlob({
			...jump,
			jump_at: jumpAt,
			breaking_jump: previousStatus !== 'ready',
			break_notified: false,
		});
		dmx.fireEvent(dmx.CHANNELS.JumpInit);
	}
}

function handleStatic(jump) {
	switch (jump.status) {
		case 'broken':
			// FIXME: Check if all necessary tasks are fixed
			break;

		case 'cooldown':
			if (Date.now() >= jump.last_jump + COOLDOWN_LIMIT) {
				logger.info('Changing jump drive status to \'ready_to_prep\'');
				saveBlob({
					...jump,
					status: 'ready_to_prep'
				});
			} else {
				schedule(update, jump.last_jump + COOLDOWN_LIMIT);
			}
			break;

		case 'ready_to_prep':
			// no-op
			break;

		case 'calculating':
			// no-op
			break;

		case 'preparation':
			// handled elsewhere
			break;

		case 'prep_complete':
			if (Date.now() >= jump.last_jump + SAFE_JUMP_LIMIT) {
				logger.info('Changing jump drive status to \'ready\'');
				saveBlob({
					...jump,
					status: 'ready',
					breaking_jump: false
				});
			} else {
				schedule(update, jump.last_jump + SAFE_JUMP_LIMIT);
			}
			break;

		case 'ready':
			if (jump.breaking_jump) {
				logger.error('Jump drive in \'ready\' state with breaking_jump flag, fixing');
				saveBlob({
					...jump,
					status: 'ready',
					breaking_jump: false
				});
			}
			break;

		case 'jump_initiated':
			// Ignore if jump_at is zero/undefined (may occur during transition)
			if (jump.jump_at) {
				if (Date.now() >= jump.jump_at) {
					logger.info('Changing jump drive status to \'jumping\'');
					saveBlob({
						...jump,
						last_jump: Date.now(),
						jump_at: 0,
						break_notified: false,
						status: 'jumping'
					});
				} else {
					schedule(update, jump.jump_at);
				}
			}
			break;

		case 'jumping':
			// no-op
			if (jump.breaking_jump && !jump.break_notified) {
				if (Date.now() >= jump.last_jump + BREAKING_JUMP_TIME) {
					saveBlob({
						...jump,
						break_notified: true,
					});
					dmx.fireEvent(dmx.CHANNELS.JumpBreaking);
				} else {
					schedule(update, jump.last_jump + BREAKING_JUMP_TIME);
				}
			}
			break;

		default:
			logger.error(`Jump drive in unknown state '${jump.status}'`);
			break;
	}
}


function update() {
	try {
		handleStatic(store.getState().data.ship.jump);
	} catch (e) {
		logger.error('checkCurrentState caused exception', e);
	}
}


watch(['data', 'ship', 'jump'], (current, previous, state) => {
	if (current.status !== previous.status) {
		handleTransition(current, current.status, previous.status);
	}
	handleStatic(current);
});

// Check current state every 10 secs for safety
interval(update, 10000);
