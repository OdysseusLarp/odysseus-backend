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
const COUNTDOWN = 1 * MIN;

function handleTransition(jump, currentStatus, previousStatus) {
	logger.info(`Jump drive transition ${previousStatus} -> ${currentStatus}`);
	const now = Date.now();
	const lastJump = jump.last_jump || Date.now();
	switch (`${previousStatus}>${currentStatus}`) {
		case 'jumping>cooldown':
			dmx.fireEvent(dmx.CHANNELS.JumpEnd);
			// FIXME: Turn on necessary power sockets (unless done by tekniikkatiimi)
			logger.info(`Updating jump drive times`);
			saveBlob({
				...jump,
				last_jump: lastJump,
				jump_at: 0,
				safe_jump: false,
			});
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
			saveBlob({
				...jump,
				breaking_jump: true,
			});
			dmx.fireEvent(dmx.CHANNELS.JumpInitBreaking);
			break;

		case 'ready>jump_initiated':
			saveBlob({
				...jump,
				breaking_jump: false,
			});
			dmx.fireEvent(dmx.CHANNELS.JumpInit);
			break;

		case 'jump_initiated>jumping':
			dmx.fireEvent(dmx.CHANNELS.JumpStart);
			logger.info(`Updating jump drive times`);
			// FIXME: Turn off necessary power sockets (unless done by tekniikkatiimi)
			saveBlob({
				...jump,
				last_jump: now,
				jump_at: 0,
			});
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
		});
	}
}

function handleStatic(jump) {
	switch (jump.status) {
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
					safe_jump: true
				});
			} else {
				schedule(update, jump.last_jump + SAFE_JUMP_LIMIT);
			}
			break;

		case 'ready':
			if (!jump.safe_jump && Date.now() >= jump.last_jump + SAFE_JUMP_LIMIT) {
				logger.error('Jump drive in \'ready\' state without safe_jump flag, fixing');
				saveBlob({
					...jump,
					status: 'ready',
					safe_jump: true
				});
			}
			break;

		case 'jump_initiated':
			// Ignore if jump_at is zero/undefined (may occur during transition)
			if (jump.jump_at && Date.now() >= jump.jump_at) {
				logger.info('Changing jump drive status to \'jumping\'');
				saveBlob({
					...jump,
					status: 'jumping'
				});
			} else if (jump.jump_at) {
				schedule(update, jump.jump_at);
			}
			break;

		case 'jumping':
			// no-op
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

