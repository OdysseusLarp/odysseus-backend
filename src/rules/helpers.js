import { logger } from '../logger';
import store from '../store/store';

/**
 * Save a data blob to the Redux store. Postpones save until next tick.
 * @param {*} data
 */
export function saveBlob(data) {
	timeout(() => {
		store.dispatch({
			type: 'SET_DATA',
			dataType: data.type,
			dataId: data.id,
			data
		});
	});
}

/**
 * Run function at regular interval, while catching any exceptions.
 *
 * @param {function} fn         Function to run
 * @param {number} millisecs    Run function every this many milliseconds
 */
export function interval(fn, millisecs) {
	setInterval(() => {
		try {
			fn();
		} catch (e) {
			logger.error('Interval rule caused exception', e);
		}
	}, millisecs);
}

/**
 * Call function at next tick or after defined timeout, while catching any exceptions.
 *
 * If milliseconds is undefined, uses `process.nextTick` which may
 * cause starvation of other pending tasks.  A zero value uses
 * `setTimeout` which should not starve other tasks.
 *
 * @param {function} fn Function to call
 */
export function timeout(fn, milliseconds) {
	if (milliseconds === undefined) {
		process.nextTick(() => {
			try {
				fn();
			} catch (e) {
				logger.error('\'timeout\' callback threw an exception', e);
			}
		});
	} else {
		setTimeout(() => {
			try {
				fn();
			} catch (e) {
				logger.error('\'timeout\' callback threw an exception', e);
			}
		}, milliseconds);
	}
}

const scheduled = {};
/**
 * Run the function at the specified timestamp, while preventing
 * it from being run multiple times per timestamp.
 *
 * @param {function} fn Function to call
 * @param {number} timestamp Timestamp when to run
 */
export function schedule(fn, timestamp) {
	const fns = scheduled[timestamp] || [];
	for (const existing of fns) {
		if (existing === fn) {
			return;
		}
	}
	fns.push(fn);
	scheduled[timestamp] = fns;
	setTimeout(() => {
		removeFromScheduled(fn, timestamp);
		fn();
	}, timestamp - Date.now());
}

function removeFromScheduled(fn, timestamp) {
	const array = scheduled[timestamp];
	const index = array.indexOf(fn);
	if (index >= 0) {
		array.splice(index, 1);
	}
	if (array.length === 0) {
		delete scheduled[timestamp];
	}
}
