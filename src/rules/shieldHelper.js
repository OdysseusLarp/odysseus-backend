import { randomInt } from './helpers';

export const CODE_COUNT = 243;  // 3^5
export const MEASURED_INDEX = 3;

export function getSingleStates(code) {
	const states = [];
	for (let i=0; i<5; i++) {
		states[i] = (code % 3) - 1;
		code = Math.floor(code / 3);
	}
	return states;
}

export function getCombinedStates(...codes) {
	const states = [0, 0, 0, 0, 0];
	for (const code of codes) {
		const state = getSingleStates(code);
		for (let i=0; i<5; i++) {
			states[i] += state[i];
		}
	}
	return states.map(n => Math.sign(n));
}

export function getCode(...codes) {
	return codes.map(n => hex(n)).join('-');
}

function hex(n) {
	const hex = n.toString(16).toUpperCase();
	if (hex.length === 1) {
		return `0${hex}`;
	} else {
		return hex;
	}
}

export function randomState() {
	const state = {};
	const codes = [0, 0, 0, 0].map(() => randomInt(0, CODE_COUNT-1));
	state.code = getCode(...codes);
	state.states = getCombinedStates(...codes);
	state.measuredValue = state.states[MEASURED_INDEX];
	return state;
}

// for (let i=0; i<CODE_COUNT; i++) {
// 	console.log(getCode(i) + "\t" + getSingleStates(i).join("\t"))
// }

// for (let i=0; i<CODE_COUNT; i++) {
// 	console.log(getCode(i) + " " + JSON.stringify(getSingleStates(i)))
// 	for (let j=0; j<CODE_COUNT; j++) {
// 		console.log(getCode(i,j) + " " + JSON.stringify(getCombinedStates(i,j)));
// 	}
// }

// for (let i=0; i<10; i++) {
// 	console.log(JSON.stringify(randomState()))
// }
