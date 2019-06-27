const blobs = [];


// Reactor  DONE

for (let i=0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i/5));
	const number = i % 5 + 1;
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
		eeHealth: 0.10,  // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 0,
		calibrationCount: 0,
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

for (let i=0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i/5));
	const number = i % 5 + 1;
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
		eeHealth: 0.10,  // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 0,
		calibrationCount: 0,
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
		duration: 30,
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

for (let i=0; i < 20; i++) {
	let letter;
	if (i < 10) {
		letter = 'L';
	} else {
		letter = 'R';
	}
	const number = i % 10 + 1;
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
		eeHealth: 0.10,  // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 0,
		calibrationCount: 0,
		title: `Maneuver power segment ${code}`,
		description: `Maneuver power segment ${code} has failed. Phase shift needs to be recalibrated using HANSCA.`,
		location: letter === 'L' ? 'Upper deck, medbay' : 'Upper deck, corridor',
		map: letter === 'L' ? 'upper-6.png' : 'upper-5.png',
		mapX: letter === 'L' ? 200 : 150,
		mapY: letter === 'L' ? 40 : 290,
	});
}


blobs.push({
	type: 'game_config',
	id: 'maneuver',

	'default': {
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

for (let i=0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i/2));
	const number = i % 2 + 1;
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
		eeHealth: 0.10,  // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 0,
		calibrationCount: 0,
		title: `Front shield segment ${code}`,
		description: `Front shield generator shield segment ${code} has failed. Segment needs to be repaired using HANSCA.`,
		location: 'Lower deck, corridor',
		map: 'lower-6.png',
		mapX: 80,
		mapY: 300,
	});
}


blobs.push({
	type: 'game_config',
	id: 'frontshield',
	"default": {
		initDescription: `<p>Front shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

        "game": "lightsout",
        "random": 10,
        "size": 4,
	},
	"skill:master": {
		initDescription: `<p>Front shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

        "game": "lightsout",
        "random": 7,
        "size": 4,
	},
	"skill:expert": {
		initDescription: `<p>Front shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

        "game": "lightsout",
        "random": 4,
        "size": 4,
	},
});


// Rear shields

for (let i=0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i/2));
	const number = i % 2 + 1;
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
		eeHealth: 0.10,  // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 0,
		calibrationCount: 0,
		title: `Rear shield segment ${code}`,
		description: `Rear shield generator shield segment ${code} has failed. Segment needs to be repaired using HANSCA.`,
		location: 'Upper deck, war room',
		map: 'upper-9.png',
		mapX: 150,
		mapY: 300,
	});
}


blobs.push({
	type: 'game_config',
	id: 'rearshield',
	"default": {
		initDescription: `<p>Rear shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

        "game": "lightsout",
        "random": 10,
        "size": 4,
	},
	"skill:master": {
		initDescription: `<p>Rear shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

        "game": "lightsout",
        "random": 7,
        "size": 4,
	},
	"skill:expert": {
		initDescription: `<p>Rear shield generator shield segments are faulted.</p>
		<p>You need to heal all faulty segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the system will become operational.</p>
		<p>You may reset the shield segments to a random state.</p>`,
		endDescription: 'All shield segments fixed!',

        "game": "lightsout",
        "random": 4,
        "size": 4,
	},
});



// Missile system  DONE

for (let i=0; i < 20; i++) {
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
			title: `Missile tube region ${code} damaged`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		eeType: 'missilesystem',
		eeHealth: 0.10,  // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 0,
		calibrationCount: 0,
		title: `Missile tube region ${code} damaged`,
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
		game: 'flappy',
		gap: 150,
		interval: 250,
		gravity: 1.7,
		score: 20
	},

	'skill:master': {
		initDescription: `<p>Missile system repairs require sending a drone.</p>
		<p>You must fly the drone to the missile tube. Tap HANSCA to fly upwards.</p>`,
		endDescription: 'Drone successfully arrived at missile tube. Repairs started.',
		failDescription: 'Drone destroyed!',
		game: 'flappy',
		gap: 150,
		interval: 250,
		gravity: 1.6,
		score: 10
	},

	'skill:expert': {
		initDescription: `<p>Missile system repairs require sending a drone.</p>
		<p>You must fly the drone to the missile tube. Tap HANSCA to fly upwards.</p>`,
		endDescription: 'Drone successfully arrived at missile tube. Repairs started.',
		failDescription: 'Drone destroyed!',
		game: 'flappy',
		gap: 150,
		interval: 250,
		gravity: 1.3,
		score: 7
	},

});



// Beam weapons

for (let i=0; i < 20; i++) {
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
		eeHealth: 0.10,  // fixes 10%
		game: id,
		status: 'initial',
		calibrationTime: 0,
		calibrationCount: 0,
		title: `Beam weapon segment ${code}`,
		description: `Beam weapon segment ${code} has fallen out-of-sync with the ship quantum state. The quantum phase must be recalibrated using HANSCA.`,
		location: 'Upper deck, corridor',
		map: 'upper-3.png',
		mapX: 240,
		mapY: 20,
	});
}


blobs.push({
	type: 'game_config',
	id: 'beamweapons',

	'default': {
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

for (let i=0; i < 20; i++) {
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
			title: `Hull region ${code} damaged`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		eeType: 'hull',
		eeHealth: 0.05,  // fixes 5% (max 100%)
		game: id,
		status: 'initial',
		calibrationTime: 0,
		calibrationCount: 0,
		title: `Hull region ${code} damaged`,
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
		game: 'flappy',
		gap: 150,
		interval: 250,
		gravity: 1.3,
		score: 7
	},

});




export default blobs;
