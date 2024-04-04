/*
 * Helpers for beam weapons button board tasks
 */

import { randomInt } from './helpers';

const MODE_NAMES = ['Tarix', 'Darix', 'Tavon', 'Davon', 'Talux', 'Dalux'];

export function randomState() {
	const state = {};
	const n1 = randomInt(0, 5);
	const n2 = randomInt(0, 5);
	state.charging_mode = MODE_NAMES[n1];
	state.discharging_mode = MODE_NAMES[n2];
	// Discharge bottom-right measured, even off, odd on
	state.measuredValue = n2 % 2;
	return state;
}
