import { rng } from './helpers';

export const CODE_COUNT = 4*80;

const LETTERS = ['AA', 'CG', 'JA', 'PX'];


export function getCode(n) {
	const num = n % 80;
	const letter = Math.floor(n/80);
	return `${LETTERS[letter]}${num+1}`;
}

export function getConnections(n) {
	const random = rng(n*100);
	const wires = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
	const count = Math.floor(random.next().value * 5) + 8;
	const connections = {};
	for (let i = 0; i < 24; i++) {
		connections[`${i}`] = [];
	}
	for (let i = 0; i < count; i++) {
		const index1 = Math.floor(random.next().value * wires.length);
		const wire1 = wires.splice(index1, 1)[0];
		const index2 = Math.floor(random.next().value * wires.length);
		const wire2 = wires.splice(index2, 1)[0];
		connections[`${wire1}`] = [wire2];
		connections[`${wire2}`] = [wire1];
	}
	return connections;
}


// for (let i=0; i<CODE_COUNT; i++) {
// 	const connections = getConnections(i);
// 	let str = getCode(i) + "\t";
// 	for (const wire1 of Object.keys(connections)) {
// 		if (connections[wire1].length > 0) {
// 			const wire2 = connections[wire1][0];
// 			if (wire1 < wire2) {
// 				str = `${str} ${parseInt(wire1,10)+1}-${parseInt(wire2,10)+1}`
// 			}
// 		}
// 	}
// 	console.log(str);
// }

