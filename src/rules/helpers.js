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
 * @returns {number} Interval ID that can be used to clear the interval
 */
export function interval(fn, millisecs) {
	return setInterval(() => {
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

/**
 * Generate Brownian values within a range.
 *
 * @param {number} max Value is kept within range [-max, max]
 * @param {number} multiplier Max difference of value in one step
 */
export function* brownianGenerator(max, multiplier = max/10) {
	let value = 0;
	while (true) {
		value = Math.min(value, max);
		value = Math.max(value, -max);
		value += (Math.random() - 0.5) * 2 * multiplier;
		yield value;
	}
}

export function clamp(num, min, max) {
	return num < min ? min : num > max ? max : num;
}

export function random(min, max) {
	return min + Math.random() * (max-min);
}

/**
 * Return a random integer between min-max, both inclusive.
 * @param {integer} min Minimun value (inclusive)
 * @param {integer} max Maximum value (inclusive)
 */
export function randomInt(min, max) {
	return Math.floor(Math.random() * (max-min+1)) + min;
}

/**
 * Choose n elements (default one) from an array. Returns array of
 * n elements (or the whole array if shorter than n) in random order.
 *
 * From https://stackoverflow.com/a/49479872/412896
 *
 * @param {array} array Array from which to choose elements from
 * @param {number} n How many random elements to choose
 */
export function chooseRandom(array, n = 1) {
	return array
	  .map(x => ({ x, r: Math.random() }))
	  .sort((a, b) => a.r - b.r)
	  .map(a => a.x)
	  .slice(0, n);
}


/**
 * Seedable random number generator for deterministic output
 */
export function* rng(seed = 1) {
	while (true) {
		seed++;
		const x = Math.sin(seed++) * 10000;
		yield x - Math.floor(x);
	}
}

/**
 * Return the tasks with the highest priority
 * @param {array} tasks
 */
export function getPriorityTasks(tasks) {
	const maxPriority = tasks.reduce((max, task) => Math.max(max, task.priority ? task.priority : 0), -Infinity);
	return tasks.filter(task => (task.priority ? task.priority : 0) === maxPriority);
}
