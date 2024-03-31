/*
 * Helpers for BWMS button board tasks
 */

import { randomInt } from './helpers';

export function randomState() {
	const state = {};
	state.code = randomInt(1, 63);
	// Bottom-right switch measured, corresponds to bit 6
	// Button is wired to connect to DOWN_INDEX, corresponding to -1 value
	state.measuredValue = state.code & 0b100000 ? -1 : 0;
	return state;
}
