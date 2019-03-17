import { watch } from '../../store/store';
import { logger } from '../../logger';
import { setTaskBroken, setTaskCalibrating } from '../tasks/tasks';

/**
 * Mark fuse box tasks as broken or fixed automatically.
 */
watch(['data', 'box'], (currentBoxes, previousBoxes, state) => {
	for (const box of Object.values(currentBoxes)) {
		if (box.rules !== 'fusebox' || !box.fuses) {
			continue;
		}

		const id = box.id;
		if (!state.data.task || !state.data.task[id]) {
			logger.error(`Could not find task corresponding to fuse box ID '${id}'`);
			continue;
		}
		const task = state.data.task[id];

		const broken = box.fuses.find(e => e === 0) !== undefined;
		if (broken) {
			if (task.status !== 'broken') {
				logger.info(`Marking task '${id}' as broken due to fuses being blown: ${JSON.stringify(box.fuses)}`);
				setTaskBroken(task);
			}
		} else {
			if (task.status === 'broken') {
				logger.info(`Marking task '${id}' as calibrating due to fuses being fixed: ${JSON.stringify(box.fuses)}`);
				setTaskCalibrating(task);
			}
		}
	}
});
