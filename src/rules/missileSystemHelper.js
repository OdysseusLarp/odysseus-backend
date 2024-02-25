
/*
 * Helpers for missile system button board tasks
 */

import { randomInt } from "./helpers";

const MEASURED_INDEX = 7;

export function randomState() {
	const state = {};
	state.activationInterval = randomInt(2, 4);  // cycle 2-4
	state.initiationPoint = randomInt(1, state.activationInterval);  // 1 - activationInterval
	// Calculate state of eighth switch
	state.measuredValue = ((8 - state.initiationPoint) % state.activationInterval === 0) ? 1 : 0;
	return state;
}
