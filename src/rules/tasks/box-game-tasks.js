import { watch } from '../../store/store';
import { logger } from '../../logger';
import { setTaskBroken, setTaskCalibrating } from './tasks';


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
			setTaskBroken(task);
		}
	} else {
		if (task.status === 'broken') {
			logger.info(`Marking task '${blob.task}' as calibrating based on ` +
				`${blob.type} '${blob.id}' status '${blob.status}'`);
			setTaskCalibrating(task);
		}
	}
}

/**
 * Mark box tasks as broken or calibrating automatically.
 */
watch(['data'], (data) => {
	for (const blob of Object.values(data.box || [])) {
		updateTask(blob, data);
	}
	for (const blob of Object.values(data.game || [])) {
		updateTask(blob, data);
	}
});
