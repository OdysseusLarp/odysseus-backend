const blobs = [];

for (let i=0; i < 20; i++) {
	const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i/4));
	const number = i % 4 + 1;
	const code = letter + number;
	const id = `lifesupport_${code}`;

	blobs.push({
		type: 'game',
		id,
		task: id,
		game_config: 'lifesupport',
		status: 'fixed',
		config: {
			title: `Life support power line ${code}`,
		},
	});
	blobs.push({
		type: 'task',
		id,
		lifesupportHealth: 0.0425,  // fixes 4.25%, total 85%
		game: id,
		status: 'fixed',
		calibrationTime: 0,
		calibrationCount: 0,
		title: `Life support power line ${code}`,
		description: `Life support power line ${code} maximum current has been overloaded. The power line currents must be redistributed using HANSCA.`,
		location: 'Upper deck, security room',  // FIXME: location
		map: 'upper-7.png',
		mapX: 240,
		mapY: 310 + i*2,
	});
}


blobs.push({
	'type': 'game_config',
	'id': 'lifesupport',

	'default': {
		initDescription: `<p>Life support power line maximum current has been overloaded. The power line currents must be redistributed.</p>
		<p>Switch the enabled power lines on and off until the total current is zero. Each power line increases or decreases the total current with a specific amount.</p>`,
		endDescription: 'Power line current redistribution successful!',
		game: 'balance',

		count: 10,
		max: 6,
		unit: 'A',
		decimals: 1,
		gameTitle: 'Current balancing',
		hintAfter: 150,
	},

	'skill:master': {
		initDescription: `<p>Life support power line maximum current has been overloaded. The power line currents must be redistributed.</p>
		<p>Switch the enabled power lines on and off until the total current is zero. Each power line increases or decreases the total current with a specific amount.</p>`,
		endDescription: 'Power line current redistribution successful!',
		game: 'balance',

		count: 10,
		max: 4,
		unit: 'A',
		decimals: 1,
		gameTitle: 'Current balancing',
		hintAfter: 150,
	},

	'skill:expert': {
		initDescription: `<p>Life support power line maximum current has been overloaded. The power line currents must be redistributed.</p>
		<p>Switch the enabled power lines on and off until the total current is zero. Each power line increases or decreases the total current with a specific amount.</p>`,
		endDescription: 'Power line current redistribution successful!',
		game: 'balance',

		count: 10,
		max: 2,
		unit: 'A',
		decimals: 1,
		gameTitle: 'Current balancing',
		hintAfter: 150,
	},
});

export default blobs;
