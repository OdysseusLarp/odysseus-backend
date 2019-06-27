const blobs = [];

blobs.push({
	id: 'jump_drive_spectral_calibration',
	type: 'box',
	status: 'initial',
	task: 'jump_drive_spectral_calibration',
});

blobs.push({
	id: 'jump_drive_spectral_calibration',
	type: 'task',
	status: 'initial',
	title: 'Jump drive spectral calibration',
	description: 'Perform jump drive spectral calibration (separate instructions).',
	calibrationTime: 2.5*60,
	calibrationCount: 1,
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

export default blobs;
