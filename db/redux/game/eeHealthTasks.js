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
		title: `Reactor power segment ${code}`,
		status: 'fixed',
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
		map: 'map.png', // FIXME: map
		mapX: 100,
		mapY: 200,
	});
}


blobs.push({
	type: 'game_config',
	id: 'reactor',
	description: 'Reactor phase sync',  // FIXME: babbletize
	default: {
		game: 'phasesync'
		// FIXME: Settings
	},
	engineer_proficient: {
		game: 'phasesync'
		// FIXME: Settings
	}
});

export default blobs;
