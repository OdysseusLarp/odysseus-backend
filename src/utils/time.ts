export function getRandomNumberBetween(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Duration is an object that provides methods to convert time units to milliseconds.
 */
export const Duration = {
	/**
	 * Converts seconds to milliseconds.
	 * @param {number} seconds - The number of seconds to convert.
	 * @returns {number} The number of milliseconds.
	 */
	seconds(seconds: number): number {
		return seconds * 1000;
	},

	/**
	 * Converts minutes to milliseconds.
	 * @param {number} minutes - The number of minutes to convert.
	 * @returns {number} The number of milliseconds.
	 */
	minutes(minutes: number): number {
		return minutes * 60 * 1000;
	}
};
