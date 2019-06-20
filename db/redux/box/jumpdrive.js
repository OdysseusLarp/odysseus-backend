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
	description: '...',  // FIXME: Add description
	calibrationTime: 60,
	calibrationCount: 1,
	map: 'map01.png',
	mapX: 100,
	mapY: 200,
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
	description_template: 'Configure to state {{code}}',  // FIXME: Add description + reference to paper manual page
	calibrationTime: 60,
	calibrationCount: 1,
	map: 'map01.png',
	mapX: 100,
	mapY: 200,
});

export default blobs;
