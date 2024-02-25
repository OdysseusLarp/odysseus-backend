import { saveBlob, randomInt } from './helpers';
import * as shield from './shieldHelper';
import * as wiring from './wiringHelper';
import * as missile from './missileSystemHelper';
import store from '../store/store';
import { logger } from '../logger';

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
		status: 'broken'
	});
}


function getAdditionalContext(box, task) {
	let ctx = {};
	if (box.boxType === 'shield_button') {
		do {
			ctx = {
				context: shield.randomState()
			};
		} while (ctx.context.measuredValue === box.context.measuredValue);
	} else if (box.boxType === 'missile_button'){
		do {
			ctx = {
				context: missile.randomState()
			};
		} while (ctx.context.measuredValue === box.context.measuredValue);
	} else if (box.boxType === 'reactor_wiring') {
		const n = randomInt(0, wiring.CODE_COUNT-1);
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
