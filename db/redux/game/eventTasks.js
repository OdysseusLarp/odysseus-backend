const blobs = [
	// Gas leak next to stairs
	{
		type: 'game',
		id: 'gas_leak',
		task: 'gas_leak',
		game_config: 'missilesystem',
		status: 'fixed',
		config: {
			title: 'Missile system gas leak',
		},
	},
	{
		type: 'task',
		id: 'gas_leak',
		eeType: 'missilesystem',
		priority: -10,
		eeHealth: 0.3,
		game: 'gas_leak',
		status: 'initial',
		calibrationTime: 0,
		calibrationCount: 0,
		title: 'Missile system gas leak',
		description:
			'Missile system gas leak in mess hall. Drone needs to be sent for repairs. Use HANSCA for performing repairs.',
		location: 'Lower deck, Mess hall near stairway',
		map: 'deck1',
		mapX: 910,
		mapY: 1370,
	},

	// Radiation leak near end of science bay
	{
		type: 'game',
		id: 'radiation_leak',
		task: 'radiation_leak',
		game_config: 'frontshield', // use lights out game
		status: 'fixed',
		config: {
			title: 'Missile system radiation leak',
			initDescription:
				'<p>Missile system radiation leakage detected.</p><p>You need to seal all faulty pressure segments. When you click a segment, the segment and all immediately adjacent segments will heal or break. Once all segments are healed (black), the leak will be contained.</p><p>You may reset the segments to a random state.</p>',
			endDescription: 'Leak contained!',
		},
	},
	{
		type: 'task',
		id: 'radiation_leak',
		eeType: 'missilesystem',
		priority: -10,
		eeHealth: 0.3,
		game: 'radiation_leak',
		status: 'initial',
		calibrationTime: 0,
		calibrationCount: 0,
		title: 'Missile system radiation leak',
		description:
			'Missile system radiation leakage detected in Science lab. Faulty pressure segments need to be repaierd using HANSCA.',
		location: 'Upper deck, Science lab',
		map: 'deck2',
		mapX: 1010,
		mapY: 635,
	},
];

export default blobs;
