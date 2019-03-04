import { logger } from '../logger';

/**
 * Run function at regular interval, while catching any exceptions.
 *
 * @param {number} millisecs    Run function every this many milliseconds
 * @param {function} fn         Function to run
 */
export function interval(millisecs, fn) {
	setInterval(() => {
		try {
			fn();
		} catch (e) {
			logger.error('Interval rule caused exception', e);
		}
	}, millisecs);
}

/**
 * Call function at next tick, while catching any exceptions.
 *
 * This uses `process.nextTick` and may cause starvation of other pending tasks.
 *
 * @param {function} fn Function to call
 */
export function postpone(fn) {
	process.nextTick(() => {
		try {
			fn();
		} catch (e) {
			logger.error('postpone caused exception', e);
		}
	});
}
