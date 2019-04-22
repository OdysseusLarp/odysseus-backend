/* eslint-disable camelcase, no-unused-vars */

import { saveBlob, interval, brownianGenerator, clamp } from '../helpers';
import { SAFE_JUMP_LIMIT } from './jump';
import store from '../../store/store';


const STATUS_NUMBERS = {
	broken: 0,
	cooldown: 1,
	ready_to_prep: 2,
	calculating: 3,
	preparation: 4,
	prep_complete: 5,
	ready: 6,
	jump_initiated: 7,
	jumping: 8,
};

/*
 * Temperature range:
 * cooldown 800
 * regular run 4100
 * breaking run 5600
 * brownian randomness +-100
 *
 * Nominal:		< 3900
 * High:  		3900 - 5200
 * Critical:	> 5200
 *
 * Heat up speed:  +17 / s
 *   800 -> 4000 in 3m10s
 *   800 -> 5200 in 4m20s
 *
 * Cooldown speed:  -0.6 / s
 *   5500 -> 800 in 2h10m
 */

const jumpDriveBrownian = brownianGenerator(100);
const INCREASE_TEMP = 17;
const DECREASE_TEMP = 0.6;
const COOL_TEMP = 800;
const REGULAR_JUMP_TEMP = 4100;
const BREAKING_JUMP_TEMP = 5600;

// Fitted so that at COOLDOWN_LIMIT / SAFE_JUMP_LIMIT results in 20%
const COHERENCE_EXPONENT = 7.566;
// Reduce 1% with this probabilyty every second (100% -> 0% in ~16min)
const COHERENCE_DECREASE_PROB = 0.1;

function updateTemperature(jumpstate) {
	let target_temp;
	if (jumpstate.status === 'jumping') {
		if (jumpstate.breaking_jump) {
			target_temp = BREAKING_JUMP_TEMP;
		} else {
			target_temp = REGULAR_JUMP_TEMP;
		}
	} else {
		target_temp = COOL_TEMP;
	}

	let delta = (target_temp - jumpstate.jump_drive_temp_exact) * 0.02;
	delta = clamp(delta, -DECREASE_TEMP, INCREASE_TEMP);
	jumpstate.jump_drive_temp_exact += delta;
	jumpstate.jump_drive_temp = jumpstate.jump_drive_temp_exact + jumpDriveBrownian.next().value;
}

function updateCoherence(jumpstate, jump) {
	if (jumpstate.status === 'jump_initiated') {
		// no-op, keep value fixed
	} else if (jumpstate.status === 'jumping') {
		// Decrease randomly
		if (jumpstate.coherence > 1) {
			if (Math.random() < COHERENCE_DECREASE_PROB) {
				jumpstate.coherence -= 1;
			}
		}
	} else {
		// Calculate from previous jump time
		const dt = Date.now() - jump.last_jump;
		const dx = clamp(dt / SAFE_JUMP_LIMIT, 0, 1);
		const percentage = Math.floor(Math.pow(dx, COHERENCE_EXPONENT) * 100);
		jumpstate.coherence = clamp(percentage, 0, 100);
	}
}

function updateData() {
	const jump = store.getState().data.ship.jump;
	const jumpstate = {
		...store.getState().data.ship.jumpstate,
		status: jump.status,
		statusno: STATUS_NUMBERS[jump.status],
		breaking_jump: jump.breaking_jump,
	};
	updateTemperature(jumpstate);
	updateCoherence(jumpstate, jump);
	saveBlob(jumpstate);
}

interval(updateData, 1000);

