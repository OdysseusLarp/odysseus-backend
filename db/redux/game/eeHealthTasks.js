const blobs = [];


// Reactor

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
		description: `Reactor power segment ${code} has failed.`, // FIXME: babbletize
		location: 'Upper deck, security room',
		map: 'upper-7.png',
		mapX: 240,
		mapY: 310 + i*2,
	});
}


blobs.push({
	type: 'game_config',
	id: 'reactor',
	default: {
		initDescription: 'Reactor power segment needs phase calibration',  // FIXME: babbletize
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		// FIXME: Fine-tune settings for suitable difficulty
		dimensions: 2,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},
	// engineer_proficient: {
	// 	game: 'phasesync'
	// 	...
	// }
});



// Engine

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
			title: `Engine power segment ${code}`,
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
		title: `Engine power segment ${code}`,
		description: `Engine power segment ${code} has failed.`, // FIXME: babbletize
		location: 'Lower deck, mess hall', // FIXME: location + map, baaritiski
		map: 'upper-7.png',
		mapX: 240,
		mapY: 310 + i*2,
	});
}


blobs.push({
	type: 'game_config',
	id: 'impulse',
	default: {
		initDescription: 'Engine power segment needs phase calibration',  // FIXME: babbletize
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		// FIXME: Fine-tune settings for suitable difficulty
		dimensions: 2,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},
	// engineer_proficient: {
	// 	game: 'phasesync'
	// 	...
	// }
});


// Maneuver

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
		description: `Maneuver power segment ${code} has failed.`, // FIXME: babbletize
		location: 'Upper deck, medbay (left) corridor (right)', // FIXME: location + map
		map: 'upper-7.png',
		mapX: 240,
		mapY: 310 + i*2,
	});
}


blobs.push({
	type: 'game_config',
	id: 'maneuver',
	default: {
		initDescription: 'Maneuver power segment needs phase calibration',  // FIXME: babbletize
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		// FIXME: Fine-tune settings for suitable difficulty
		dimensions: 2,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},
	// engineer_proficient: {
	// 	game: 'phasesync'
	// 	...
	// }
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
			title: `Front shield generator power segment ${code}`,
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
		title: `Front shield generator power segment ${code}`,
		description: `Front shield generator power segment ${code} has failed.`, // FIXME: babbletize
		location: 'Lower deck, corridor', // FIXME: location + map
		map: 'upper-7.png',
		mapX: 240,
		mapY: 310 + i*2,
	});
}


blobs.push({
	type: 'game_config',
	id: 'frontshield',
	default: {
		initDescription: 'Front shield generator power segment needs phase calibration',  // FIXME: babbletize
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		// FIXME: Fine-tune settings for suitable difficulty
		dimensions: 2,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},
	// engineer_proficient: {
	// 	game: 'phasesync'
	// 	...
	// }
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
			title: `Rear shield generator power segment ${code}`,
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
		title: `Rear shield generator power segment ${code}`,
		description: `Rear shield generator power segment ${code} has failed.`, // FIXME: babbletize
		location: 'Upper deck, war room', // FIXME: location + map
		map: 'upper-7.png',
		mapX: 240,
		mapY: 310 + i*2,
	});
}


blobs.push({
	type: 'game_config',
	id: 'rearshield',
	default: {
		initDescription: 'Rear shield generator power segment needs phase calibration',  // FIXME: babbletize
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		// FIXME: Fine-tune settings for suitable difficulty
		dimensions: 2,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},
	// engineer_proficient: {
	// 	game: 'phasesync'
	// 	...
	// }
});



// Missile system

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
			title: `Missile system power segment ${code}`,
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
		title: `Missile system power segment ${code}`,
		description: `Missile system power segment ${code} has failed.`, // FIXME: babbletize
		location: 'Upper deck, security room', // FIXME: location + map
		map: 'upper-7.png',
		mapX: 240,
		mapY: 310 + i*2,
	});
}


blobs.push({
	type: 'game_config',
	id: 'missilesystem',
	default: {
		initDescription: 'Missile system power segment needs phase calibration',  // FIXME: babbletize
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		// FIXME: Fine-tune settings for suitable difficulty
		dimensions: 2,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},
	// engineer_proficient: {
	// 	game: 'phasesync'
	// 	...
	// }
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
			title: `Beam weapons power segment ${code}`,
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
		title: `Beam weapons power segment ${code}`,
		description: `Beam weapons power segment ${code} has failed.`, // FIXME: babbletize
		location: 'Upper ramp', // FIXME: location + map  - ramp
		map: 'upper-7.png',
		mapX: 240,
		mapY: 310 + i*2,
	});
}


blobs.push({
	type: 'game_config',
	id: 'beamweapons',
	default: {
		initDescription: 'Beam weapons power segment needs phase calibration',  // FIXME: babbletize
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		// FIXME: Fine-tune settings for suitable difficulty
		dimensions: 2,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},
	// engineer_proficient: {
	// 	game: 'phasesync'
	// 	...
	// }
});




// Hull

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
			title: `Hull power segment ${code}`,
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
		title: `Hull power segment ${code}`,
		description: `Hull power segment ${code} has failed.`, // FIXME: babbletize
		location: 'Lower deck, stairways', // FIXME: location + map portaat
		map: 'upper-7.png',
		mapX: 240,
		mapY: 310 + i*2,
	});
}


blobs.push({
	type: 'game_config',
	id: 'hull',
	default: {
		initDescription: 'Hull power segment needs phase calibration',  // FIXME: babbletize
		endDescription: 'Phase calibration successful!',
		game: 'phasesync',

		// FIXME: Fine-tune settings for suitable difficulty
		dimensions: 2,
		difficulty: 0.2,
		duration: 1,
		drift: 0,
	},
	// engineer_proficient: {
	// 	game: 'phasesync'
	// 	...
	// }
});




export default blobs;
