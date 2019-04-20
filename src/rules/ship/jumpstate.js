/* eslint-disable camelcase, no-unused-vars */

import { saveBlob, interval, brownianGenerator, clamp } from '../helpers';
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
const REGULAR_JUMP_TEMP = 4000;
const BREAKING_JUMP_TEMP = 5600;

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

function updateData() {
	const jump = store.getState().data.ship.jump;
	const jumpstate = {
		...store.getState().data.ship.jumpstate,
		status: jump.status,
		statusno: STATUS_NUMBERS[jump.status],
		breaking_jump: jump.breaking_jump,
	};
	updateTemperature(jumpstate);
	saveBlob(jumpstate);
}

interval(updateData, 1000);

