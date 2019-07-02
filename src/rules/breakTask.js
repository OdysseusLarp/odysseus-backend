import { saveBlob } from './helpers';
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
	saveBlob({
		...toBeBroken,
		status: 'broken'
	});
}