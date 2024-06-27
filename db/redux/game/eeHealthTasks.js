const blobs = [];

/*
 * Priority 0:  default level for tasks, balanced mix of games + manual tasks
 * Priority -1: "backup" tasks in case all on prio 0 are broken
 */

// Seedable randon number generator for deterministic output
let seed = 1;
function rnd() {
	const x = Math.sin(seed++) * 10000;
	return x - Math.floor(x);
}

/**
 * Generator which returns the provided number of 0's and -1's in random order.
 * @param {integer} normalCount Number of priority 0 elements
 * @param {integer} lowCount Number of priority -1 elements
 * @param {integer} highCount Number of priority 1 elements
 */
function* priorityGenerator(normalCount, lowCount, highCount = 0) {
	const array = [...Array(normalCount).fill(0), ...Array(lowCount).fill(-1), ...Array(highCount).fill(1)];
	while (array.length > 0) {
		const index = Math.floor(rnd() * array.length);
		yield array.splice(index, 1)[0];
	}
}
let priority;

// Reactor  DONE

priority = priorityGenerator(17, 0, 3);
for (let i = 0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 5));
	const number = (i % 5) + 1;
	const code = letter + number;
	const id = `reactor_${code}`;

	blobs.push({
		type: 'game',
		id,
		task: id,
		game_config: 'reactor',
		status: 'fixed',
		config: {
			title: `Reactor power segment ${code}`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		eeType: 'reactor',
		priority: priority.next().value,
		eeHealth: 0.1, // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 10 * 60,
		calibrationCount: 1,
		title: `Reactor power segment ${code}`,
		description: `Reactor power segment ${code} has failed. Phase shift needs to be recalibrated using HANSCA.`,
		location: 'Upper deck, War room',
		map: 'deck2',
		mapX: 570,
		mapY: 1755,
	});
}

blobs.push({
	type: 'game_config',
	id: 'reactor',

	default: {
		initDescription: 'Reactor power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 2,
		difficulty: 0.4,
		duration: 1,
		drift: 0.15,
	},

	'skill:master': {
		initDescription: 'Reactor power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 2,
		difficulty: 0.4,
		duration: 1,
		drift: 0.05,
	},

	'skill:expert': {
		initDescription: 'Reactor power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 2,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},
});

// Engine  DONE

priority = priorityGenerator(10, 10);
for (let i = 0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 5));
	const number = (i % 5) + 1;
	const code = letter + number;
	const id = `impulse_${code}`;

	blobs.push({
		type: 'game',
		id,
		task: id,
		game_config: 'impulse',
		status: 'fixed',
		config: {
			title: `Impulse engine power segment ${code}`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		eeType: 'impulse',
		priority: priority.next().value,
		eeHealth: 0.1, // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 5 * 60,
		calibrationCount: 1,
		title: `Impulse engine power segment ${code}`,
		description: `Impulse engine power segment ${code} has failed. Phase shift needs to be recalibrated using HANSCA.`,
		location: 'Upper deck, Security room',
		map: 'deck2',
		mapX: 380,
		mapY: 1870,
	});
}

blobs.push({
	type: 'game_config',
	id: 'impulse',

	default: {
		initDescription: 'Impulse engine power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 1,
		difficulty: 0,
		duration: 40,
		drift: 0.3,
	},

	'skill:master': {
		initDescription: 'Impulse engine power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 1,
		difficulty: 0,
		duration: 30,
		drift: 0.15,
	},

	'skill:expert': {
		initDescription: 'Impulse engine power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 1,
		difficulty: 0,
		duration: 20,
		drift: 0.1,
	},
});

// Maneuver  DONE

priority = priorityGenerator(10, 10);
for (let i = 0; i < 20; i++) {
	let letter;
	if (i < 10) {
		letter = 'L';
	} else {
		letter = 'R';
	}
	const number = (i % 10) + 1;
	const code = letter + number;
	const id = `maneuver_${code}`;

	blobs.push({
		type: 'game',
		id,
		task: id,
		game_config: 'maneuver',
		status: 'fixed',
		config: {
			title: `Maneuver power segment ${code}`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		eeType: 'maneuver',
		priority: priority.next().value,
		eeHealth: 0.1, // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 7 * 60,
		calibrationCount: 1,
		title: `Maneuver power segment ${code}`,
		description: `Maneuver power segment ${code} has failed. Phase shift needs to be recalibrated using HANSCA.`,
		location: letter === 'L' ? 'Upper deck, corridor outside Security room' : 'Upper deck, corridor outside Bridge',
		map: 'deck2',
		mapX: letter === 'L' ? 450 : 600,
		mapY: letter === 'L' ? 1735 : 930,
	});
}

blobs.push({
	type: 'game_config',
	id: 'maneuver',

	default: {
		initDescription: 'Maneuver power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 4,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},

	'skill:master': {
		initDescription: 'Maneuver power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 4,
		difficulty: 0.1,
		duration: 1,
		drift: 0,
	},

	'skill:expert': {
		initDescription: 'Maneuver power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 4,
		difficulty: 0.075,
		duration: 1,
		drift: 0,
	},
});

// Front shields

priority = priorityGenerator(10, 10);
for (let i = 0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 2));
	const number = (i % 2) + 1;
	const code = letter + number;
	const id = `frontshield_${code}`;

	blobs.push({
		type: 'game',
		id,
		task: id,
		game_config: 'frontshield',
		status: 'fixed',
		config: {
			title: `Front shield segment ${code}`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		eeType: 'frontshield',
		priority: priority.next().value,
		eeHealth: 0.1, // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 2 * 60,
		calibrationCount: 5,
		title: `Front shield segment ${code}`,
		description: `Front shield generator shield segment ${code} has failed. Segment needs to be repaired using HANSCA.`,
		location: 'Upper deck, Bridge',
		map: 'deck2',
		mapX: 200,
		mapY: 1100,
	});
}

blobs.push({
	type: 'game_config',
	id: 'frontshield',
	default: {
		initDescription: `<p>Front shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

		game: 'lightsout',
		random: 10,
		size: 4,
	},
	'skill:master': {
		initDescription: `<p>Front shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

		game: 'lightsout',
		random: 7,
		size: 4,
	},
	'skill:expert': {
		initDescription: `<p>Front shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

		game: 'lightsout',
		random: 4,
		size: 4,
	},
});

// Rear shields

priority = priorityGenerator(10, 10);
for (let i = 0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 2));
	const number = (i % 2) + 1;
	const code = letter + number;
	const id = `rearshield_${code}`;

	blobs.push({
		type: 'game',
		id,
		task: id,
		game_config: 'rearshield',
		status: 'fixed',
		config: {
			title: `Rear shield segment ${code}`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		eeType: 'rearshield',
		priority: priority.next().value,
		eeHealth: 0.1, // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 2 * 60,
		calibrationCount: 5,
		title: `Rear shield segment ${code}`,
		description: `Rear shield generator shield segment ${code} has failed. Segment needs to be repaired using HANSCA.`,
		location: 'Upper deck, Green room',
		map: 'deck2',
		mapX: 990,
		mapY: 910,
	});
}

blobs.push({
	type: 'game_config',
	id: 'rearshield',
	default: {
		initDescription: `<p>Rear shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

		game: 'lightsout',
		random: 10,
		size: 4,
	},
	'skill:master': {
		initDescription: `<p>Rear shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

		game: 'lightsout',
		random: 7,
		size: 4,
	},
	'skill:expert': {
		initDescription: `<p>Rear shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

		game: 'lightsout',
		random: 4,
		size: 4,
	},
});

// Missile system  DONE

priority = priorityGenerator(10, 10);
for (let i = 0; i < 20; i++) {
	const number = i + 1;
	const code = `${number}`;
	const id = `missilesystem_${code}`;

	blobs.push({
		type: 'game',
		id,
		task: id,
		game_config: 'missilesystem',
		status: 'fixed',
		config: {
			title: `Missile tube region ${code}`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		eeType: 'missilesystem',
		priority: priority.next().value,
		eeHealth: 0.1, // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 6 * 60,
		calibrationCount: 2,
		title: `Missile tube region ${code}`,
		description: `Missile tube region ${code} is damaged. Drone needs to be sent for repairs. Use HANSCA for performing repairs.`,
		location: 'Lower deck, Armory',
		map: 'deck1',
		mapX: 575,
		mapY: 1700,
	});
}

blobs.push({
	type: 'game_config',
	id: 'missilesystem',

	default: {
		initDescription: `<p>Missile system repairs require sending a drone.</p>
		<p>You must fly the drone to the missile tube. Tap HANSCA to fly upwards.</p>`,
		endDescription: 'Drone successfully arrived at missile tube. Repairs started.',
		failDescription: 'Drone destroyed!',
		preFailDescription: 'No drones available!',
		preCondition: '/data/misc/flappy_drone',
		game: 'flappy',
		gap: 150,
		interval: 250,
		gravity: 1.7,
		score: 20,
	},

	'skill:master': {
		initDescription: `<p>Missile system repairs require sending a drone.</p>
		<p>You must fly the drone to the missile tube. Tap HANSCA to fly upwards.</p>`,
		endDescription: 'Drone successfully arrived at missile tube. Repairs started.',
		failDescription: 'Drone destroyed!',
		preFailDescription: 'No drones available!',
		preCondition: '/data/misc/flappy_drone',
		game: 'flappy',
		gap: 150,
		interval: 250,
		gravity: 1.6,
		score: 10,
	},

	'skill:expert': {
		initDescription: `<p>Missile system repairs require sending a drone.</p>
		<p>You must fly the drone to the missile tube. Tap HANSCA to fly upwards.</p>`,
		endDescription: 'Drone successfully arrived at missile tube. Repairs started.',
		failDescription: 'Drone destroyed!',
		preFailDescription: 'No drones available!',
		preCondition: '/data/misc/flappy_drone',
		game: 'flappy',
		gap: 150,
		interval: 250,
		gravity: 1.3,
		score: 7,
	},
});

// Beam weapons

priority = priorityGenerator(10, 10);
for (let i = 0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + i);
	const code = `${letter}`;
	const id = `beamweapons_${code}`;

	blobs.push({
		type: 'game',
		id,
		task: id,
		game_config: 'beamweapons',
		status: 'fixed',
		config: {
			title: `Beam weapon segment ${code}`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		eeType: 'beamweapons',
		priority: priority.next().value,
		eeHealth: 0.1, // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 8 * 60,
		calibrationCount: 1,
		title: `Beam weapon segment ${code}`,
		description: `Beam weapon segment ${code} has fallen out-of-sync with the ship quantum state. The quantum phase must be recalibrated using HANSCA.`,
		location: 'Upper deck, Science lab',
		map: 'deck2',
		mapX: 950,
		mapY: 720,
	});
}

blobs.push({
	type: 'game_config',
	id: 'beamweapons',

	default: {
		initDescription: 'Beam weapon requires phase recalibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 2,
		difficulty: 0.4,
		duration: 1,
		drift: 0.15,
	},

	'skill:master': {
		initDescription: 'Beam weapon requires phase recalibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 2,
		difficulty: 0.4,
		duration: 1,
		drift: 0.05,
	},

	'skill:expert': {
		initDescription: 'Beam weapon requires phase recalibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 2,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},
});

// Hull  DONE

priority = priorityGenerator(5, 15);
for (let i = 0; i < 20; i++) {
	let letter;
	if (i < 10) {
		letter = 'L';
	} else {
		letter = 'R';
	}
	const number = (i % 10) + 1;
	const code = letter + number;
	const id = `hull_${code}`;

	blobs.push({
		type: 'game',
		id,
		task: id,
		game_config: 'hull',
		status: 'fixed',
		config: {
			title: `Hull region ${code}`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		eeType: 'hull',
		priority: priority.next().value,
		eeHealth: 0.05, // fixes 5% (max 100%)
		game: id,
		status: 'initial',
		calibrationTime: 20 * 60,
		calibrationCount: 1,
		title: `Hull region ${code}`,
		description: `Hull region ${code} is damaged. Drone needs to be sent for repairs. Use HANSCA for performing repairs.`,
		location: 'Lower deck, under stairway',
		map: 'deck1',
		mapX: letter === 'L' ? 970 : 475,
		mapY: letter === 'L' ? 1500 : 1150,
	});
}

blobs.push({
	type: 'game_config',
	id: 'hull',

	default: {
		initDescription: `<p>Manual hull repairs required using a drone.</p>
		<p>You must fly the drone to the hull area. Tap HANSCA to fly upwards.</p>`,
		endDescription: 'Drone successfully arrived at hull. Repairs started.',
		failDescription: 'Drone destroyed!',
		preFailDescription: 'No drones available!',
		preCondition: '/data/misc/flappy_drone',
		game: 'flappy',
		gap: 150,
		interval: 250,
		gravity: 1.7,
		score: 20,
	},

	'skill:master': {
		initDescription: `<p>Manual hull repairs required using a drone.</p>
		<p>You must fly the drone to the hull area. Tap HANSCA to fly upwards.</p>`,
		endDescription: 'Drone successfully arrived at hull. Repairs started.',
		failDescription: 'Drone destroyed!',
		preFailDescription: 'No drones available!',
		preCondition: '/data/misc/flappy_drone',
		game: 'flappy',
		gap: 150,
		interval: 250,
		gravity: 1.6,
		score: 10,
	},

	'skill:expert': {
		initDescription: `<p>Manual hull repairs required using a drone.</p>
		<p>You must fly the drone to the hull area. Tap HANSCA to fly upwards.</p>`,
		endDescription: 'Drone successfully arrived at hull. Repairs started.',
		failDescription: 'Drone destroyed!',
		preFailDescription: 'No drones available!',
		preCondition: '/data/misc/flappy_drone',
		game: 'flappy',
		gap: 150,
		interval: 250,
		gravity: 1.3,
		score: 7,
	},
});

export default blobs;
