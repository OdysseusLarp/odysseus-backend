
const LETTER1 = ['C', 'E', 'F', 'H'];
const LETTER2 = ['D', 'R', 'T', 'X'];
const LETTER3 = ['A', 'E', 'I', 'U'];

// https://docs.google.com/document/d/1zdeoUQ3YgztciU4yB1AYPC0FBCUCMWxsuXX7z59Or_U/edit#heading=h.u2wurxs8aa9t
const LIGHTS = [
	['0_3', '1_3', '2_3', '3_3', '4_3', '5_3', '6_3'],
	['3_0', '3_1', '3_2', '3_3', '3_4', '3_5', '3_6'],
	['0_2', '2_2', '3_2', '4_2', '5_2', '6_2'],
	['2_0', '2_1', '2_2', '2_3', '2_4', '2_6'],
	['0_4', '1_4', '2_4', '3_4', '4_4', '6_4'],
	['4_0', '4_2', '4_3', '4_4', '4_5', '4_6'],
	['1_1', '2_1', '3_1', '5_1'],
	['1_1', '1_3', '1_4', '1_5'],
	['1_5', '3_5', '4_5', '5_5'],
	['5_1', '5_2', '5_3', '5_5'],
];

// Broken leds are always black
const BROKEN_LEDS = ['5_3', '3_0'];

export function getCode(n) {
	/*
	 * Lowest
	 * 4 bits = number
	 * 2 bits = letter
	 * 2 bits = letter
	 * 2 bits = letter
	 * Highest
	 */
	const num = n & 0b1111;
	const let3 = (n >> 4) & 0b11;
	const let2 = (n >> 6) & 0b11;
	const let1 = (n >> 8) & 0b11;
	return `${LETTER1[let1]}${LETTER2[let2]}${LETTER3[let3]}-${num+1}`;
}

function filled(value = () => 0) {
	const map = {};
	for (const array of LIGHTS) {
		for (const index of array) {
			map[index] = value(index);
		}
	}
	return map;
}

export function getLights(n) {
	const lights = filled();
	for (let i = 0; i < 10; i++) {
		if ((n >> i) & 1) {
			for (const index of LIGHTS[i]) {
				lights[index] ^= 1;
			}
		}
	}
	for (const broken of BROKEN_LEDS) {
		lights[broken] = 0;
	}

	return lights;
}

export function randomGauges() {
	// Round values so that resulting JSON is smaller
	const values = filled(() => Math.floor(Math.random()*100)/100);
	for (const broken of BROKEN_LEDS) {
		delete values[broken];
	}
	return values;
}

// for (let i=0; i<1024; i++) {
// 	console.log(`${i}: ${getCode(i)}`);
// 	console.log(JSON.stringify(getLights(i)));
// 	console.log(JSON.stringify(randomGauges()));
// }
