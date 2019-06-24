const blobs = [];

for (let i=0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i/5));
	const number = i % 5 + 1;
	const code = letter + number;
	const id = `reactor_${i+1}`;

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
		eeHealth: 0.05,  // fixes 5%
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

export default blobs;
