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

export default blobs;
