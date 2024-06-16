/* eslint-disable camelcase, no-unused-vars */

import { saveBlob, interval, brownianGenerator, clamp } from '../helpers';
import { SAFE_JUMP_LIMIT, COOLDOWN_LIMIT } from './jump';
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

// Fitted so that at COOLDOWN_LIMIT / SAFE_JUMP_LIMIT results in 20%
const COHERENCE_EXPONENT = 7.566;
// Reduce 1% with this probabilyty every second (100% -> 0% in ~16min)
const COHERENCE_DECREASE_PROB = 0.1;

function updateTemperature(jumpstate, jump) {
	const target_temp = jump.jump_drive_target_temp;

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

function twodigit(x) {
	if (x < 10) {
		return `0${x}`;
	} else {
		return `${x}`;
	}
}

function formatT(t) {
	// Positive --> T-01:23:45
	// Zero     --> T-00:00:00
	// Negative --> T+00:01:23

	let sign;
	if (t < 0) {
		sign = '+';
	} else {
		sign = '-';
	}

	const abs = Math.abs(t);
	const hour = Math.floor(abs / 60 / 60);
	const min = Math.floor((abs / 60) % 60);
	const sec = Math.floor(abs % 60);

	return `T${sign}${twodigit(hour)}:${twodigit(min)}:${twodigit(sec)}`;
}

function updateTValues(jumpstate, jump) {
	let dt;

	// readyT
	switch (jumpstate.status) {
		case 'broken':
		case 'cooldown':
		case 'ready_to_prep':
		case 'calculating':
		case 'preparation':
		case 'prep_complete':
			dt = Math.ceil((jump.last_jump + SAFE_JUMP_LIMIT - Date.now()) / 1000);
			dt = Math.max(dt, 0);
			jumpstate.readyRemaining = dt;
			jumpstate.readyT = formatT(dt);
			break;

		case 'ready':
			// This is separately in case state is manually changed to 'ready'
			jumpstate.readyRemaining = 0;
			jumpstate.readyT = formatT(0);
			break;

		case 'jump_initiated':
		case 'jumping':
			// Do not update
			break;
	}

	// cooldownT
	if (jumpstate.status === 'broken' || jumpstate.status === 'cooldown') {
		dt = Math.ceil((jump.last_jump + COOLDOWN_LIMIT - Date.now()) / 1000);
		dt = Math.max(dt, 0);
		jumpstate.cooldownRemaining = dt;
		jumpstate.cooldownT = formatT(dt);
	} else {
		jumpstate.cooldownRemaining = 0;
		jumpstate.cooldownT = formatT(0);
	}

	// jumpT
	if (jumpstate.status === 'jump_initiated') {
		dt = Math.ceil((jump.jump_at - Date.now()) / 1000);
		jumpstate.jumpT = formatT(dt);
	} else if (jumpstate.status === 'jumping') {
		dt = Math.ceil((jump.last_jump - Date.now()) / 1000);
		jumpstate.jumpT = formatT(dt);
	} else {
		jumpstate.jumpT = '';
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
	updateTemperature(jumpstate, jump);
	updateCoherence(jumpstate, jump);
	updateTValues(jumpstate, jump);
	saveBlob(jumpstate);
}

interval(updateData, 1000);
