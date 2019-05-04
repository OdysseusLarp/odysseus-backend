import { saveBlob, interval, schedule } from '../helpers';
import store, { watch } from '../../store/store';
import * as dmx from '../../dmx';
import { logger } from '../../logger';

// Jump drive state spec:
// https://docs.google.com/presentation/d/1nbXQE9N10Zm7uS45eW4R1VvYU4zZQ0PZbRovUq7bA5o/edit#slide=id.g4d32841109_0_0

const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;
const SEC = 1000;

export const COOLDOWN_LIMIT = 2 * HOUR + 15 * MIN + 43 * SEC;
export const SAFE_JUMP_LIMIT = 2 * HOUR + 47 * MIN;
export const BREAKING_JUMP_TIME = 5 * MIN;
const COUNTDOWN = 1 * MIN;

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
			break;

		case 'broken>cooldown':
			dmx.fireEvent(dmx.CHANNELS.JumpFixed);
			break;

		case 'cooldown>ready_to_prep':
			dmx.fireEvent(dmx.CHANNELS.JumpPrepReady);
			break;

		case 'ready_to_prep>calculating':
			dmx.fireEvent(dmx.CHANNELS.JumpPrepStart);
			break;

		case 'calculating>ready_to_prep':
			dmx.fireEvent(dmx.CHANNELS.JumpRejected);
			break;

		case 'calculating>preparation':
			dmx.fireEvent(dmx.CHANNELS.JumpApproved);
			logger.info(`Initializing jump drive tasks`);
			// FIXME: Add tasks for engineers
			break;

		case 'preparation>prep_complete':
			dmx.fireEvent(dmx.CHANNELS.JumpPrepEnd);
			break;

		case 'prep_complete>ready':
			dmx.fireEvent(dmx.CHANNELS.JumpReady);
			break;

		case 'jump_initiated>prep_complete':
			dmx.fireEvent(dmx.CHANNELS.JumpAbort);
			break;

		case 'prep_complete>jump_initiated':
		case 'ready>jump_initiated':
			// Handled below in if-statement
			break;

		case 'jump_initiated>jumping':
			dmx.fireEvent(dmx.CHANNELS.JumpStart);
			// FIXME: Turn off necessary power sockets (unless done by tekniikkatiimi)
			break;

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
			if (jump.breaking_jump && Date.now() >= jump.last_jump + SAFE_JUMP_LIMIT) {
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

