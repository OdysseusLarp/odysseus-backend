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
		initDescription: `<p>Hyperspace communicator ionic phaser needs to be stabilized.</p>`,
		endDescription: 'Stabilization successful!',
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
		initDescription: `<p>Hyperspace communicator tachyon decoherence levels need to be synchronized.</p>
		<p>Adjust the decoherence levels until all levels are aligned and in locked state.</p>`,
		endDescription: 'Tachyon decoherence synchronization successful!',
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
		initDescription: `<p>Hyperspace communicator spatial disruptors need to be discharged.</p>
		<p>You need to discharge all segments. When you click a segment, the segment and all immediately adjacent segments will discharge or recharge. Once all segments are discharged (black), the system will become operational.</p>
		<p>You may reset the spatial disruptor segments to a random state.</p>`,
		endDescription: 'Spatial disruptors discharged!',
		game: 'lightsout',
		random: 30,
		size: 5,
	},
});


export default blobs;
