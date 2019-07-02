const blobs = [];

blobs.push({
	type: 'game',
	id: 'velian1',
	game_config: 'velian1',
	status: 'broken',
});

blobs.push({
	type: 'game_config',
	id: 'velian1',

	default: {
		initDescription: '...',  // FIXME
		endDescription: '...!',
		game: 'phasesync',

		dimensions: 2,
		difficulty: 0.1,
		duration: 5*60,
		drift: 0.04,
	},
});


blobs.push({
	type: 'game',
	id: 'velian2',
	game_config: 'velian2',
	status: 'broken',
});

blobs.push({
	type: 'game_config',
	id: 'velian2',

	default: {
		initDescription: '...',
		endDescription: '...!',
		game: 'phasesync',

		dimensions: 5,
		difficulty: 0.5,
		duration: 1,
		drift: 0,
	},
});


blobs.push({
	type: 'game',
	id: 'velian3',
	game_config: 'velian3',
	status: 'broken',
});

blobs.push({
	type: 'game_config',
	id: 'velian3',

	default: {
		initDescription: '...',
		endDescription: '...!',
		game: 'lightsout',
		random: 30,
		size: 5,
	},
});


export default blobs;
