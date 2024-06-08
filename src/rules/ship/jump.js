import { saveBlob, interval, schedule, random, chooseRandom, randomInt, clamp } from '../helpers';
import store, { watch } from '../../store/store';
import * as dmx from '../../dmx';
import { logger } from '../../logger';
import { pick, get } from 'lodash';
import { Ship, Grid, GridAction } from '../../models/ship';
import { shipLogger } from '../../models/log';
import { MapObject } from '../../models/map-object';
import { getEmptyEpsilonClient } from '../../emptyepsilon';
import { getData } from '../../routes/data';
import * as reactor from '../reactorHelper';
import { BigBatteryLocation, isBatteryConnected } from '@/utils/bigbattery-helpers';

// Jump drive state spec:
// https://docs.google.com/presentation/d/1nbXQE9N10Zm7uS45eW4R1VvYU4zZQ0PZbRovUq7bA5o/edit#slide=id.g4d32841109_0_0

const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;
const SEC = 1000;

export const COOLDOWN_LIMIT = 2 * HOUR + 15 * MIN + 43 * SEC;
export const SAFE_JUMP_LIMIT = 2 * HOUR + 47 * MIN;
export const BREAKING_JUMP_TIME = 5 * MIN;
const COUNTDOWN = 1 * MIN;

const JUMP_CRYSTAL_LOW_THRESHOLD = 5;

const EE_TYPES = ['reactor', 'impulse', 'maneuver', 'frontshield', 'rearshield', 'missilesystem', 'beamweapons'];

/**
 * Enable or disable Jump UI and EOC Datahub
 * @param {boolean} value=true
 */
function setSystemsEnabled(value = true) {
	const shipMetadata = store.getState().data.ship.metadata;
	saveBlob({
		...shipMetadata,
		jump_ui_enabled: value,
		social_ui_enabled: value,
		infoboard_enabled: value,
	});
}

/**
 * Enable or disable EE state synchronization
 * @param {boolean} value=true
 */
export function setEeSyncEnabled(value = true) {
	const shipMetadata = store.getState().data.ship.metadata;
	saveBlob({
		...shipMetadata,
		ee_sync_enabled: value,
	});
	logger.info('Empty Epsilon state synchronization set to', value ? 'ENABLED' : 'DISABLED');
}

/**
 * Jumps the ship to a new grid by setting grid_id of the ship
 * @param {object} coordinates Target coordinates from jump state
 */
async function performShipJump(coordinates) {
	// Hard coded ship ID at this point, we are not going to jump other ships than Odysseus
	const shipId = 'odysseus';
	const jumpTargetParameters = pick(coordinates, ['sub_quadrant', 'sector', 'sub_sector']);
	const targetPlanetName = get(coordinates, 'planet_orbit');
	const promises = [Ship.forge({ id: shipId }).fetch(), Grid.forge().where(jumpTargetParameters).fetch()];
	if (targetPlanetName) {
		promises.push(MapObject.forge().where({ name_generated: targetPlanetName }).fetch());
	}
	const [ship, grid, targetPlanet] = await Promise.all(promises);
	let targetGeometry;
	if (targetPlanet) targetGeometry = targetPlanet.get('the_geom');
	else targetGeometry = await grid.getRandomJumpTarget();
	const gridId = grid ? grid.get('id') : null;
	if (!targetGeometry) {
		logger.error('Could not calculate new geometry for ship when jumping to grid', gridId);
	}
	// Reset jump range back to 1
	const metadata = { ...ship.get('metadata', {}), jump_range: 1 };
	await Promise.all([
		ship.jumpFleet({ grid_id: gridId, metadata, the_geom: targetGeometry }),
		GridAction.forge().save({ grid_id: gridId, ship_id: shipId, type: 'JUMP' }),
	]);
	logger.success(`${shipId} performed jumped to grid ${gridId}`);
}

function getReadableJumpTarget(coordinates) {
	const { sub_quadrant, sub_sector, sector } = pick(coordinates, ['sub_quadrant', 'sector', 'sub_sector']);
	const targetPlanetName = get(coordinates, 'planet_orbit');
	const gridName = `${sub_quadrant}-${sector}-${sub_sector}`;
	return targetPlanetName ? `${gridName} (orbit ${targetPlanetName})` : gridName;
}

function isJumpCrystalDone() {
	const tasks = store.getState().data.task;
	return tasks.jump_drive_insert_jump_crystal.status === 'fixed';
}

function isJumpReactorDone() {
	const tasks = store.getState().data.task;
	return tasks.jump_reactor.status === 'fixed';
}

function setupJumpDriveTasks() {
	breakJumpCrystalGame();
	breakJumpReactor();
}

function breakJumpCrystalGame() {
	const games = store.getState().data.game;
	if (games.jump_drive_insert_jump_crystal) {
		saveBlob({
			...games.jump_drive_insert_jump_crystal,
			status: 'broken',
		});
	} else {
		logger.error("No box with id 'jump_drive_insert_jump_crystal'");
	}
}

function breakJumpReactor() {
	const boxes = store.getState().data.box;
	if (boxes.jump_reactor) {
		const n = randomInt(1, 1023);
		saveBlob({
			...boxes.jump_reactor,
			status: 'broken',
			expected: reactor.randomGauges(),
			lights: reactor.getLights(n),
			context: {
				code: reactor.getCode(n),
			},
			toptext: `${n}`,
		});
	} else {
		logger.error("No box with id 'jump_reactor'");
	}
}

function chargeBigBatteryIfConnected() {
	const box = store.getState().data.box.bigbattery;
	if (isBatteryConnected(box, BigBatteryLocation.ENGINEERING)) {
		saveBlob({
			...box,
			capacity_percent: 100,
		});
	}
}

function handleTransition(jump, currentStatus, previousStatus) {
	logger.info(`Jump drive transition ${previousStatus} -> ${currentStatus}`);
	const lastJump = jump.last_jump || Date.now();
	switch (`${previousStatus}>${currentStatus}`) {
		case 'jumping>broken':
			if (jump.breaking_jump) {
				breakTasksMajor();
			} else if (jump.minor_breaking_jump) {
				breakTasksMinor();
			} else {
				breakTasksNormal();
			}
			breakJumpReactor(); // task for broken>cooldown transition
		// fall through
		case 'jumping>cooldown': {
			if (jump.breaking_jump) {
				dmx.fireEvent(dmx.CHANNELS.JumpEndBreaking);
			} else {
				dmx.fireEvent(dmx.CHANNELS.JumpEnd);
			}
			chargeBigBatteryIfConnected();
			logger.info(`Updating jump drive times`);
			saveBlob({
				...jump,
				last_jump: jump.last_jump_override || lastJump,
				last_jump_override: undefined,
				jump_at: 0,
				breaking_jump: true,
				minor_breaking_jump: Math.random() < 0.33, // randomize after jump, so first jump is always value from seed
			});
			const jumpTarget = getReadableJumpTarget(jump.coordinates);
			shipLogger.success(`Odysseus completed the jump to grid ${jumpTarget}`, {
				showPopup: true,
			});

			// Enable systems after 3600ms, which is around the time when the JumpEnd audio reaches climax
			setTimeout(() => setSystemsEnabled(true), 3600);

			// Enable Empty Epsilon state synchronization if connection status is healthy
			if (getEmptyEpsilonClient().getConnectionStatus().isConnectionHealthy) {
				setTimeout(() => setEeSyncEnabled(true), 3000);
			} else {
				logger.error('Could not enable Empty Epsilon state synchronization, connection is not healthy');
			}

			// Remove a jump crystal and send a warning if they drop below 5, unless CRYSTAL_GENERATOR artifact has been used
			const hasCrystalGenerator = get(getData('misc', 'artifact_actions'), 'actions.CRYSTAL_GENERATOR.is_used');
			if (hasCrystalGenerator) break;
			Ship.forge({ id: 'odysseus' })
				.fetch()
				.then(model => {
					const metadata = model.get('metadata');
					const jumpCrystalCount = get(metadata, 'jump_crystal_count', 1);
					const jump_crystal_count = jumpCrystalCount - 1;
					if (jump_crystal_count === 0) {
						shipLogger.warning(`Out of jump crystals`);
						dmx.fireEvent(dmx.CHANNELS.LoraJumpCrystalsDepleted);
					} else if (jump_crystal_count <= JUMP_CRYSTAL_LOW_THRESHOLD) {
						shipLogger.warning(`Jump crystal count is low (${jump_crystal_count} pcs)`);
						// Fire the DMX event only once when count drops below threshold
						if (jump_crystal_count === JUMP_CRYSTAL_LOW_THRESHOLD) {
							dmx.fireEvent(dmx.CHANNELS.LoraJumpCrystalsLow);
						}
					}
					model.save({ metadata: { ...metadata, jump_crystal_count } }, { method: 'update', patch: true });
				});
			break;
		}
		case 'broken>cooldown':
			dmx.fireEvent(dmx.CHANNELS.JumpFixed);
			break;

		case 'cooldown>ready_to_prep':
			dmx.fireEvent(dmx.CHANNELS.JumpPrepReady);
			shipLogger.info(`Jump drive is ready for jump preparations`, {
				showPopup: true,
			});
			break;

		case 'ready_to_prep>calculating': {
			dmx.fireEvent(dmx.CHANNELS.JumpPrepStart);
			const jumpTarget = getReadableJumpTarget(jump.coordinates);
			shipLogger.info(`Calculating jump vectors to target ${jumpTarget}.`, {
				showPopup: true,
			});
			break;
		}

		case 'calculating>ready_to_prep':
			dmx.fireEvent(dmx.CHANNELS.JumpRejected);
			shipLogger.error(`Failed to calculate jump vectors`, { showPopup: true });
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
			shipLogger.success(
				`Jump vectors have been calculated and jump drive preparation configuration sent to engineering`,
				{ showPopup: true }
			);
			setupJumpDriveTasks();
			break;

		case 'preparation>prep_complete':
			dmx.fireEvent(dmx.CHANNELS.JumpPrepEnd);
			shipLogger.success(`Jump drive preparations have been completed`, {
				showPopup: true,
			});
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
			shipLogger.warning(`Jump sequence initiated`);
			break;

		case 'jump_initiated>jumping': {
			// Disable Jump UI for the duration of the jump
			setSystemsEnabled(false);

			// Set Empty Epsilon alert state back to NORMAL, and disable EE
			// state synchronization after 2 seconds (we should have latest state by then)
			getEmptyEpsilonClient().setAlertLevel('normal');
			setTimeout(() => setEeSyncEnabled(false), 2000);

			const jumpTarget = getReadableJumpTarget(jump.coordinates);
			shipLogger.info(`Jumping to coordinates ${jumpTarget}.`);
			dmx.fireEvent(dmx.CHANNELS.JumpStart);

			// Fire DMX jump mood signal
			const mood = jump.next_jump_mood;
			const moodChannel = dmx.CHANNELS[`JumpStartMood${mood}`];
			if (moodChannel) {
				dmx.fireEvent(moodChannel);
			} else {
				logger.error(`Invalid jump mood ${mood}`);
			}

			// Update the ship geometry to target coordinates already so that
			// they can be fixed by GMs during the jump if needed
			performShipJump(jump.coordinates);
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
			// Avoid race condition when transitioning
			if (Date.now() > jump.updated_at + 500) {
				if (isJumpReactorDone()) {
					saveBlob({
						...jump,
						status: 'cooldown',
					});
				}
			} else {
				logger.info("Skipping 'broken' check due to updated_at being too recent");
			}
			break;

		case 'cooldown':
			if (Date.now() >= jump.last_jump + COOLDOWN_LIMIT) {
				logger.info("Changing jump drive status to 'ready_to_prep'");
				saveBlob({
					...jump,
					status: 'ready_to_prep',
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
			// Avoid race condition when transitioning to 'preparation' and tasks are not yet set up
			if (Date.now() > jump.updated_at + 500) {
				if (isJumpCrystalDone() && isJumpReactorDone()) {
					saveBlob({
						...jump,
						status: 'prep_complete',
					});
				}
			} else {
				logger.info("Skipping 'preparation' check due to updated_at being too recent");
			}
			break;

		case 'prep_complete':
			if (Date.now() >= jump.last_jump + SAFE_JUMP_LIMIT) {
				logger.info("Changing jump drive status to 'ready'");
				saveBlob({
					...jump,
					status: 'ready',
					breaking_jump: false,
				});
			} else {
				schedule(update, jump.last_jump + SAFE_JUMP_LIMIT);
			}
			break;

		case 'ready':
			if (jump.breaking_jump) {
				logger.error("Jump drive in 'ready' state with breaking_jump flag, fixing");
				saveBlob({
					...jump,
					status: 'ready',
					breaking_jump: false,
				});
			}
			break;

		case 'jump_initiated':
			// Ignore if jump_at is zero/undefined (may occur during transition)
			if (jump.jump_at) {
				if (Date.now() >= jump.jump_at) {
					logger.info("Changing jump drive status to 'jumping'");
					saveBlob({
						...jump,
						last_jump: Date.now(),
						jump_at: 0,
						break_notified: false,
						status: 'jumping',
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

/*
 * Jump breakage spec: https://docs.google.com/presentation/d/1T3lxvrgauPcpKyM31RYYDEfTDfUCgJVXkqpqUQIjVRU/edit#slide=id.g5bd843658b_0_0
 */
function breakTasksMajor() {
	breakFuses(5, 10);
	for (const type of EE_TYPES) {
		breakEE(type, 0.5, 0.8);
	}
}

function breakTasksMinor() {
	breakFuses(0, 2);
	for (const type of EE_TYPES) {
		if (Math.random() < 0.5) {
			breakEE(type, 0.05, 0.2);
		}
	}
}

function breakTasksNormal() {
	breakFuses(0, 2);
}

/**
 * Break a random amount of health between (min - max) from EE type.
 * Used also from elsewhere.
 */
export function breakEE(type, min, max) {
	const damage = random(min, max);
	if (type === 'hull') {
		const current = store.getState().data.ship.ee.general.shipHullPercent;
		const health = clamp(current - damage, -1, 1);
		logger.info(`Breaking EE '${type}' by ${damage} to ${health}`);
		// async, fire and forget
		try {
			getEmptyEpsilonClient().setHullHealthPercent(health);
		} catch (err) {
			logger.error('Could not break EE', err);
		}
	} else {
		const current = store.getState().data.ship.ee.systems.health[`${type}Health`];
		const health = clamp(current - damage, -1, 1);
		logger.info(`Breaking EE '${type}' by ${damage} to ${health}`);
		// async, fire and forget
		try {
			getEmptyEpsilonClient().setGameState('setSystemHealth', type, health);
		} catch (err) {
			logger.error('Could not break EE', err);
		}
	}
}

/**
 * Break (min - max) fuses from all fuse boxes.
 */
function breakFuses(min, max) {
	Object.values(store.getState().data.box).forEach(box => {
		if (box.fuses) {
			const count = randomInt(min, Math.min(max, box.config.blowing.length));
			logger.info(`Blowing ${count} fuses from fuse box ${box.id}`);
			if (count > 0) {
				const all = box.config.blowing.map((e, index) => index);
				const blow = chooseRandom(all, count);
				saveBlob({
					...box,
					blow,
				});
			}
		}
	});
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
