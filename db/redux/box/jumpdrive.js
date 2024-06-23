const blobs = [];

blobs.push({
	id: 'jump_drive_insert_jump_crystal',
	type: 'game',
	task: 'jump_drive_insert_jump_crystal',
	game_config: 'manual',
	status: 'initial',
	config: {
		title: 'Insert Jump Drive Jump Crystals',
		pages: [
			"<p>Perform the manual task according to instructions.</p><p>Insert the jump crystals into the designated ports to enable the ship's jump drive. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>",
			"<p>Insert Crystal into Port. Ensure each crystal is securely locked into place.</p>",
			"<p>Proceed to the calibration phase once the crystals are inserted.</p>"
		],
		buttons: [
			'Instructions',
			'Next',
			'Calibrate'
		]
	}
});

blobs.push({
	id: 'jump_drive_insert_jump_crystal',
	type: 'task',
	game: 'jump_drive_insert_jump_crystal',
	singleUse: false,
	used: false,
	status: 'initial',
	calibrationCount: 1,
	calibrationTime: 2.5*60,
	title: 'Insert jump crystal to Jump drive',
	description: 'Insert jump crystal to Jump drive (separate instructions on ESS Odysseus Operations Handbook page 2.6-56).',
	location: 'Upper deck, engineering',
	map: 'upper-5.png',
	mapX: 400,
	mapY: 180,
});

blobs.push({
	id: 'jump_reactor',
	type: 'box',
	status: 'fixed',
	task: 'jump_reactor',
	expected: {},  // written by backend
	lights: {},    // written by backend
	context: {
		code: '',
	}
});

blobs.push({
	id: 'jump_reactor',
	type: 'task',
	status: 'initial',
	title: 'Jump reactor realignment',
	description: '...',
	description_template: `Jump drive reactor cores need to be realigned to state {{code}}.

	States can be found in Ship knowledge database code JD-33 or operation manual page 2.6-23`,
	calibrationTime: 10,
	calibrationCount: 33,
	location: 'Upper deck, engineering',
	map: 'upper-5.png',
	mapX: 230,
	mapY: 130,
});

blobs.push({
	id: 'jump_cooling_system',
	type: 'task',
	status: 'initial',
	title: 'Cooling system cleanup',
	description: 'The recent dimensional shift contaminated the hyperflux cooling fluid pipes, necessitating immediate cleaning.',
	calibrationTime: 60 * 4,
	calibrationCount: 1,
	// In practice this task has two locations, but this location points to the computer that's used to complete the task
	// TODO: Update these values
	location: 'Upper deck, engineering',
	map: 'upper-5.png',
	mapX: 230,
	mapY: 130,
});

blobs.push({
	id: 'jump_cooling_system',
	type: 'box',
	status: 'fixed',
	description: "Unity game that needs to be completed after every jump.",
	task: 'jump_cooling_system',
});

export default blobs;
