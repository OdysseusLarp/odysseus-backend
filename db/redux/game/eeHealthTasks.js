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
function *priorityGenerator(normalCount, lowCount, highCount = 0) {
	const array = [
		...Array(normalCount).fill(0),
		...Array(lowCount).fill(-1),
		...Array(highCount).fill(1),
	];
	while (array.length > 0) {
		const index = Math.floor(rnd() * array.length);
		yield array.splice(index, 1)[0];
	}
}
let priority;


// Reactor  DONE

for (let i=0; i < 2; i++) {
	const code = `R${i+1}`;
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
		priority: 0,
		eeHealth: 0.3,
		game: id,
		status: 'initial',
		calibrationTime: 1*60,
		calibrationCount: 1,
		title: `Reactor power segment ${code}`,
		description: `Reactor power segment ${code} has failed. Phase shift needs to be recalibrated using HANSCA.`,
		location: 'Upper deck, security room',
		map: 'upper-7.png',
		mapX: 240,
		mapY: 310 + i*2,
	});
}


blobs.push({
	'type': 'game_config',
	'id': 'reactor',

	'default': {
		initDescription: 'Reactor power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 2,
		difficulty: 0.4,
		duration: 1,
		drift: 0.05,
	},
});



// Engine  DONE

for (let i=0; i < 2; i++) {
	const code = `E${i+1}`;
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
		priority: 0,
		eeHealth: 0.45,
		game: id,
		status: 'initial',
		calibrationTime: 2*60,
		calibrationCount: 2,
		title: `Impulse engine power segment ${code}`,
		description: `Impulse engine power segment ${code} has failed. Phase shift needs to be recalibrated using HANSCA.`,
		location: 'Lower deck, mess hall',
		map: 'lower-11.png',
		mapX: 130,
		mapY: 220,
	});
}


blobs.push({
	'type': 'game_config',
	'id': 'impulse',

	'default': {
		initDescription: 'Impulse engine power segment needs phase calibration.',
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		dimensions: 1,
		difficulty: 0,
		duration: 20,
		drift: 0.15,
	},
});


// Maneuver  DONE


// Front shields

for (let i=0; i < 2; i++) {
	const code = `FS${i+1}`;
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
		priority: 0,
		eeHealth: 0.45,
		game: id,
		status: 'initial',
		calibrationTime: 30,
		calibrationCount: 5,
		title: `Front shield segment ${code}`,
		description: `Front shield generator shield segment ${code} has failed. Segment needs to be repaired using HANSCA.`,
		location: 'Lower deck, corridor',
		map: 'lower-6.png',
		mapX: 80,
		mapY: 300,
	});
}


blobs.push({
	'type': 'game_config',
	'id': 'frontshield',
	'default': {
		initDescription: `<p>Front shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

		game: 'lightsout',
		random: 7,
		size: 4,
	},
});


// Rear shields

for (let i=0; i < 2; i++) {
	const code = `RS${i+1}`;
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
		priority: 0,
		eeHealth: 0.45,
		game: id,
		status: 'initial',
		calibrationTime: 30,
		calibrationCount: 5,
		title: `Rear shield segment ${code}`,
		description: `Rear shield generator shield segment ${code} has failed. Segment needs to be repaired using HANSCA.`,
		location: 'Upper deck, war room',
		map: 'upper-9.png',
		mapX: 150,
		mapY: 300,
	});
}


blobs.push({
	'type': 'game_config',
	'id': 'rearshield',
	'default': {
		initDescription: `<p>Front shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

		game: 'lightsout',
		random: 7,
		size: 4,
	},
});



// Missile system  DONE

for (let i=0; i < 2; i++) {
	const number = i + 1;
	const code = `MS${number}`;
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
		priority: 0,
		eeHealth: 0.45,
		game: id,
		status: 'initial',
		calibrationTime: 1*60,
		calibrationCount: 2,
		title: `Missile tube region ${code}`,
		description: `Missile tube region ${code} is damaged. Drone needs to be sent for repairs. Use HANSCA for performing repairs.`,
		location: 'Lower deck, under stairway',
		map: 'lower-13.png',
		mapX: 430,
		mapY: 200,
	});
}


blobs.push({
	'type': 'game_config',
	'id': 'missilesystem',

	'default': {
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
		score: 10
	},
});



// Beam weapons

for (let i=0; i < 2; i++) {
	const code = `BW${i+1}`;
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
		priority: 0,
		eeHealth: 0.45,
		game: id,
		status: 'initial',
		calibrationTime: 20,
		calibrationCount: 5,
		title: `Beam weapon segment ${code}`,
		description: `Beam weapon segment ${code} has fallen out-of-sync with the ship quantum state. The quantum phase must be recalibrated using HANSCA.`,
		location: 'Upper deck, corridor',
		map: 'upper-3.png',
		mapX: 240,
		mapY: 20,
	});
}


blobs.push({
	'type': 'game_config',
	'id': 'beamweapons',

	'default': {
		initDescription: `<p>Beam weapons power line maximum current has been overloaded. The power line currents must be redistributed.</p>
		<p>Switch the enabled power lines on and off until the total current is zero. Each power line increases or decreases the total current with a specific amount.</p>`,
		endDescription: 'Power line current redistribution successful!',
		game: 'balance',

		count: 10,
		max: 2,
		unit: 'A',
		decimals: 1,
		gameTitle: 'Current balancing',
		hintAfter: 20,
	},
});




// Hull  DONE

priority = priorityGenerator(5, 15);
for (let i=0; i < 2; i++) {
	let letter;
	if (i < 10) {
		letter = 'L';
	} else {
		letter = 'R';
	}
	const number = i % 10 + 1;
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
		eeHealth: 0.05,  // fixes 5% (max 100%)
		game: id,
		status: 'initial',
		calibrationTime: 20*60,
		calibrationCount: 1,
		title: `Hull region ${code}`,
		description: `Hull region ${code} is damaged. Drone needs to be sent for repairs. Use HANSCA for performing repairs.`,
		location: 'Lower deck, stairway',
		map: letter === 'L' ? 'lower-6.png' : 'lower-13.png',
		mapX: letter === 'L' ? 220: 430,
		mapY: letter === 'L' ? 250 : 230,
	});
}


blobs.push({
	'type': 'game_config',
	'id': 'hull',

	'default': {
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
		score: 20
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
		score: 10
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
		score: 7
	},

});


export default blobs;
