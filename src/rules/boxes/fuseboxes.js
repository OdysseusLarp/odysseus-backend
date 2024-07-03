import store, { watch } from '../../store/store';
import { CHANNELS, fireEvent } from '../../dmx';
import { logger } from '../../logger';
import { isNumber, isEqual } from 'lodash';
import { chooseRandom, getPriorityTasks, saveBlob } from '../helpers';

// Fire DMX signals based on dmxFuse configuration
watch(['data', 'box'], (boxes, previousBoxes, state) => {
	for (const id of Object.keys(boxes)) {
		const box = boxes[id];
		const previous = previousBoxes[id];
		if (previous && box.fuses && isNumber(box.dmxFuse) && box.fuses[box.dmxFuse] !== previous.fuses[box.dmxFuse]) {
			if (box.fuses[box.dmxFuse]) {
				if (CHANNELS[box.dmxFuseFixed]) {
					fireEvent(CHANNELS[box.dmxFuseFixed]);
				} else {
					logger.error(`Fuse box ${id} contained invalid DMX channel dmxFuseFixed=${box.dmxFuseFixed}`);
				}
			} else {
				if (CHANNELS[box.dmxFuseBroken]) {
					fireEvent(CHANNELS[box.dmxFuseBroken]);
				} else {
					logger.error(`Fuse box ${id} contained invalid DMX channel dmxFuseBroken=${box.dmxFuseBroken}`);
				}
			}
		}
	}
});

// Cause life support tasks to fail if fuse blowing has failed
watch(['data', 'box'], (boxes, previousBoxes, state) => {
	for (const id of Object.keys(boxes)) {
		const box = boxes[id];
		const previous = previousBoxes[id];
		if (previous && box.fuses && box.failed && !isEqual(box.failed, previous.failed)) {
			const count = box.failed.length;
			const breakCount = Math.ceil(count / 3);
			logger.info(`${count} fuses failed to blow in ${box.id}, breaking ${breakCount} life support tasks`);
			for (let i = 0; i < breakCount; i++) {
				breakTask();
			}
		}
	}
});

function breakTask() {
	const allTasks = Object.values(store.getState().data.task);
	const tasks = allTasks.filter((task) => {
		const isLifeSupportTask = Number.isFinite(task.lifesupportHealth);
		const isBreakable = ['fixed', 'initial'].includes(task.status);
		const isNotUsed = !task.singleUse || !task.used;
		return isLifeSupportTask && isBreakable && isNotUsed;
	});
	const priorityTasks = getPriorityTasks(tasks);
	const task = chooseRandom(priorityTasks)[0];
	if (!task) {
		logger.warn(`Cound not find life support task to break`);
		return;
	}
	const game = store.getState().data.game[task.game];
	if (!game) {
		logger.error(`Could not find game corresponding to life support task ${task.id}`);
		return;
	}
	saveBlob({
		...game,
		status: 'broken',
	});
}
