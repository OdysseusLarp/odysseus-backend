const blobs = [
	{
		type: 'game',
		id: 'demo',
		game_config: 'demo',
		status: 'broken',
		config: {
			title: 'Demo task'
		}
	},
	{
		type: 'game_config',
		id: 'demo',
		default: {
			initDescription: 'Demo needs phase calibration.',
			endDescription: 'Phase calibration successful!',
			game: 'phasesync',

			dimensions: 2,
			difficulty: 0,
			duration: 3,
			drift: 0,
		},
	},
];

export default blobs;