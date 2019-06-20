
const LETTER1 = ['C', 'E', 'F', 'H'];
const LETTER2 = ['D', 'R', 'T', 'X'];
const LETTER3 = ['A', 'E', 'I', 'U'];

const ARRAY = [0, 1, 2, 3, 4, 5, 6];
// https://docs.google.com/document/d/1zdeoUQ3YgztciU4yB1AYPC0FBCUCMWxsuXX7z59Or_U/edit#heading=h.u2wurxs8aa9t
const LIGHTS = [
	ARRAY.map(i => `${i}_3`),
	ARRAY.map(i => `3_${i}`),
	ARRAY.map(i => `${i}_2`),
	ARRAY.map(i => `2_${i}`),
	ARRAY.map(i => `${i}_4`),
	ARRAY.map(i => `4_${i}`),
	ARRAY.map(i => `${i}_1`),
	ARRAY.map(i => `1_${i}`),
	ARRAY.map(i => `${i}_5`),
	ARRAY.map(i => `5_${i}`),
];

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
	return lights;
}

export function randomGauges() {
	// Round values so that resulting JSON is smaller
	return filled(() => Math.floor(Math.random()*100)/100);
}

// for (let i=0; i<1024; i++) {
// 	console.log(`${i}: ${getCode(i)}`);
// 	console.log(JSON.stringify(getLights(i)));
// 	console.log(JSON.stringify(randomGauges()));
// }
