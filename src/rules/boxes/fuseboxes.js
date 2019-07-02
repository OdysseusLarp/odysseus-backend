import store, { watch } from '../../store/store';
import { CHANNELS, fireEvent } from '../../dmx';
import { logger } from '../../logger';
import { isNumber, isEqual } from 'lodash';
import { chooseRandom, saveBlob } from '../helpers';

// Fire DMX signals based on dmxFuse configuration
watch(['data', 'box'], (boxes, previousBoxes, state) => {
	for (const id of Object.keys(boxes)) {
		const box = boxes[id];
		const previous = previousBoxes[id];
		if (previous && box.fuses && isNumber(box.dmxFuse) && box.fuses[box.dmxFuse] !== previous.fuses[box.dmxFuse]) {
			if (box.fuses[box.dmxFuse]) {
				if (CHANNELS[box.dmxFixed]) {
					fireEvent(CHANNELS[box.dmxFixed]);
				} else {
					logger.error(`Fuse box ${id} contained invalid DMX channel dmxFixed=${box.dmxFixed}`);
				}
			} else {
				if (CHANNELS[box.dmxBroken]) {
					fireEvent(CHANNELS[box.dmxBroken]);
				} else {
					logger.error(`Fuse box ${id} contained invalid DMX channel dmxBroken=${box.dmxBroken}`);
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
			logger.info(`${count} fuses failed to blow in ${box.id}, breaking life support tasks`);
			if (count <= 3) {
				breakTask();
			} else {
				breakTask();
				breakTask();
			}
		}
	}
});

function breakTask() {
	const allTasks = Object.values(store.getState().data.task);
	const tasks = allTasks.filter(task => task.lifesupportHealth && task.status === 'fixed');
	const task = chooseRandom(tasks)[0];
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

