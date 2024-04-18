import { saveBlob, randomInt } from './helpers';
import * as shield from './shieldHelper';
import * as wiring from './wiringHelper';
import * as missile from './missileSystemHelper';
import * as bwms from './bwmsHelper';
import * as beamWeapons from './beamWeaponsHelper';
import store from '../store/store';
import { logger } from '../logger';
import { getButtonState } from './boxes/buttonboard';

/**
 * Logic to break a specific task.
 *
 * @param {object} task Task to be broken
 */
export function breakTask(task) {
	let toBeBroken;
	logger.info(`Breaking task ${task.id} of EE type ${task.eeType}`);
	for (const type of ['game', 'box']) {
		if (task[type]) {
			toBeBroken = store.getState().data[type][task[type]];
			break;
		}
	}
	if (!toBeBroken) {
		logger.error(`Could not find game/box from task ${JSON.stringify(task)}`);
		return;
	}
	if (toBeBroken.status === 'broken') {
		logger.error(`Task is already broken, id=${toBeBroken.id}`);
		return;
	}
	const ctx = getAdditionalContext(toBeBroken, task);
	saveBlob({
		...toBeBroken,
		...ctx,
		status: 'broken',
	});
}

const BUTTON_BOARD_STATE_GENERATORS = {
	shield_button: shield.randomState,
	missile_button: missile.randomState,
	bwms_button: bwms.randomState,
	beamweapon_button: beamWeapons.randomState,
};

function getAdditionalContext(box, task) {
	let ctx = {};
	if (box.boxType in BUTTON_BOARD_STATE_GENERATORS) {
		// Check current state of switch and ensure task requires switch to be flipped
		const buttonboard = store.getState().data.box.buttonboard;
		const currentButtonState = getButtonState(buttonboard, box.buttonIndex);
		do {
			ctx = {
				context: BUTTON_BOARD_STATE_GENERATORS[box.boxType](),
			};
		} while (ctx.context.measuredValue === currentButtonState);
	} else if (box.boxType === 'reactor_wiring') {
		const n = randomInt(0, wiring.CODE_COUNT - 1);
		const code = wiring.getCode(n);
		const expected = wiring.getConnections(n);
		ctx = {
			context: {
				code,
			},
			expected,
		};
	}
	return ctx;
}
