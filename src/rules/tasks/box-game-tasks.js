import { watch, store } from '../../store/store';
import { logger } from '../../logger';
import { setTaskBroken, setTaskCalibrating } from './tasks';
import { interval } from '../helpers';


function updateTask(blob, data) {
	if (!blob.status || !blob.task) {
		return;
	}

	if (!data.task || !data.task[blob.task]) {
		logger.error(`Could not find task '${blob.task}' defined in ${blob.type} '${blob.id}'`);
		return;
	}
	const task = data.task[blob.task];

	const broken = blob.status === 'broken';
	if (broken) {
		if (task.status !== 'broken') {
			logger.info(`Marking task '${blob.task}' as broken based on ` +
				`${blob.type} '${blob.id}' status '${blob.status}'`);
			setTaskBroken(task, blob.context);
		}
	} else {
		if (task.status === 'broken') {
			logger.info(`Marking task '${blob.task}' as calibrating based on ` +
				`${blob.type} '${blob.id}' status '${blob.status}'`);
			setTaskCalibrating(task, blob.context);
		}
	}
}

/**
 * Mark box tasks as broken or calibrating automatically.
 */
watch(['data'], (data, previous) => {
	for (const id of Object.keys(data.box || [])) {
		if (previous.box[id] && data.box[id].status !== previous.box[id].status) {
			updateTask(data.box[id], data);
		}
	}
	for (const id of Object.keys(data.game || [])) {
		if (previous.game[id] && data.game[id].status !== previous.game[id].status) {
			updateTask(data.game[id], data);
		}
	}
});

// Check regularly just for safety
interval(() => {
	const data = store.getState().data;
	for (const id of Object.keys(data.box || [])) {
		updateTask(data.box[id], data);
	}
	for (const id of Object.keys(data.game || [])) {
		updateTask(data.game[id], data);
	}
}, 10000);
