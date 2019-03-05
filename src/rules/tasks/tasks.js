/*
 * Generic task rules relating to moving between broken, calibrating and fixed states.
 */
import { store } from '../../store/store';
import { logger } from '../../logger';
import { interval, postpone } from '../helpers';
import { get } from 'lodash';

/**
 * Mark a task as broken and commit to store.
 *
 * @param {*} task Task to mark as broken
 */
export function setTaskBroken(task) {
	task = { ...task };
	task.status = 'broken';
	task.sort = Date.now();
	postpone(() => {
		store.dispatch({
			type: 'SET_DATA',
			dataType: task.type,
			dataId: task.id,
			data: task
		});
	});
}

/**
 * Mark a task as calibrating and commit to store.  The calibration times
 * are set according to `calibrationTime` and `calibrationSpeed` to random
 * values between 0.8 - 1.3.
 *
 * If the task requires no calibration, it is marked as fixed instead.
 *
 * @param {*} task Task to mark as calibrating
 */
export function setTaskCalibrating(task) {
	task = { ...task };
	if (!task.calibrationSlots || !task.calibrationTime) {
		setTaskFixed(task);
	} else {
		task.status = 'calibrating';
		task.calibrationRemaining = new Array(task.calibrationSlots).fill(task.calibrationTime);
		task.calibrationSpeed = new Array(task.calibrationSlots).map(() => Math.random * 0.5 + 0.8);
		task.sort = Date.now();
		postpone(() => {
			store.dispatch({
				type: 'SET_DATA',
				dataType: task.type,
				dataId: task.id,
				data: task
			});
		});
	}
}

/**
 * Mark a task as fixed and commit to store.
 *
 * @param {*} task Task to mark as fixed
 */
export function setTaskFixed(task) {
	task = { ...task };
	task.status = 'fixed';
	task.fixed_at = Date.now();
	task.sort = -task.fixed_at;
	postpone(() => {
		store.dispatch({
			type: 'SET_DATA',
			dataType: task.type,
			dataId: task.id,
			data: task
		});
	});
}

/**
 * Decrease calibration times and mark tasks as fixed once calibration times are zero.
 */
const DECREASE_INTERVAL = 3;
interval(DECREASE_INTERVAL * 1000, () => {
	let calibrationSlots = 3; // FIXME: Read from somewhere instead of having fixed value
	const calibrating = Object.values(get(store.getState(), 'data.task', {}))
		.filter(task => task.status === 'calibrating')
		.sort((a, b) => a.sort - b.sort);
	calibrating.forEach(t => {
		const task = { ...t, calibrationRemaining: t.calibrationRemaining.concat() };
		let modified = false;
		let fixed = true;
		if (!task.calibrationRemaining || !task.calibrationSpeed) {
			logger.error('Calibrating task does not have calibrationRemaining or calibrationSpeed: ', task);
			return;
		}
		for (let i = 0; i < task.calibrationRemaining.length; i++) {
			if (calibrationSlots > 0 && task.calibrationRemaining[i] > 0) {
				task.calibrationRemaining[i] = Math.max(
					0,
					task.calibrationRemaining[i] - task.calibrationSpeed[i] * DECREASE_INTERVAL
				);
				calibrationSlots -= 1;
				modified = true;
			}
			if (task.calibrationRemaining[i] > 0) {
				fixed = false;
			}
		}
		if (fixed) {
			setTaskFixed(task);
		} else if (modified) {
			postpone(() => {
				store.dispatch({
					type: 'SET_DATA',
					dataType: task.type,
					dataId: task.id,
					data: task
				});
			});
		}
	});
});
