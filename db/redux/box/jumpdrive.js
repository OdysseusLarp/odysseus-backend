const blobs = [];

blobs.push({
	id: 'jump_drive_colors',
	type: 'box',
	status: 'initial',
	task: 'jump_drive_colors',
	context: {
		color: 'red'  // FIXME: Update to proper context
	}
});

blobs.push({
	id: 'jump_drive_colors',
	type: 'task',
	status: 'initial',
	title: 'Jump drive configuration',
	description: '...',
	description_template: 'Jump drive configuration required.\n\nRequired state: {{color}}',
	calibrationTime: 150,
	calibrationCount: 1,
	map: 'map01.png',
	mapX: 100,
	mapY: 200,
});

export default blobs;
