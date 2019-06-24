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
	description_template: 'Configure to state {{code}}',  // FIXME: Add description + reference to paper manual page
	calibrationTime: 60,
	calibrationCount: 1,
	location: 'Upper deck, engineering',
	map: 'upper-5.png',
	mapX: 230,
	mapY: 130,
});

export default blobs;
