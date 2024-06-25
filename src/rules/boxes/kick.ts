import store from '@/store/store';
import { STATUS_NUMBERS } from '../ship/jumpstate';
import { breakTask } from '../breakTask';
import { logger } from '@/logger';

function breakWithProbability() {
	const task = store.getState().data.task.thermic_fusion_regulator;
	const p = task.failure_probability_per_minute;
	const occurred = Math.random() < p;
	const jumpstate = store.getState().data.ship.jumpstate;
	// Do not break task in ready, jump_initiated or jumping states
	if (jumpstate.statusno < STATUS_NUMBERS.ready && occurred && task.status !== 'broken') {
		logger.info('Randomly breaking task thermic_fusion_regulator');
		breakTask(task);
	}
}

setInterval(breakWithProbability, 60000);
