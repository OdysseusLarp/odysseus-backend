/**
 * Sleep for the provided number of milliseconds
 */
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
