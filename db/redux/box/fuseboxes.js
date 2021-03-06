const boxes = [
	{
		type: 'box',
		id: 'fusebox_medbay',
		config: {
			blowing: [4, 15, 18, 22, 24,  9, 11, 7],
			measure: [14, 17, 27, 23, 10, 25,  8, 5],
		},
		dmxFuse: 5,  // Which fuse index triggers the following DMX events (optional)
		dmxFixed: 'MedbayFuseFixed',
		dmxBroken: 'MedbayFuseBroken',
	},
	{
		type: 'box',
		id: 'fusebox_engineering',
		config: {
			blowing: [4, 15, 18, 22, 24,  9, 11, 7],
			measure: [14, 17, 27, 23, 10, 25,  8, 5],
		},
		dmxFuse: 7,
		dmxFixed: 'EngineeringFuseFixed',
		dmxBroken: 'EngineeringFuseBroken',
	},
	{
		type: 'box',
		id: 'fusebox_bridge',
		config: {
			blowing: [4, 15, 18, 22, 24,  9, 11, 7,  6, 13, 16, 20],
			measure: [14, 17, 27, 23, 10, 25,  8, 5, 12, 19, 26, 21],
		},
		dmxFuse: 4,
		dmxFixed: 'BridgeFuseFixed',
		dmxBroken: 'BridgeFuseBroken',
	},
	{
		type: 'box',
		id: 'fusebox_science',
		config: {
			blowing: [4, 15, 18, 22, 24,  9, 11, 7],
			measure: [14, 17, 27, 23, 10, 25,  8, 5],
		},
		dmxFuse: 1,
		dmxFixed: 'ScienceFuseFixed',
		dmxBroken: 'ScienceFuseBroken',
	},
	{
		type: 'box',
		id: 'fusebox_lounge',
		config: {
			blowing: [4, 15, 18, 22, 24,  9, 11, 7],
			measure: [14, 17, 27, 23, 10, 25,  8, 5],
		},
		dmxFuse: 6,
		dmxFixed: 'LoungeFuseFixed',
		dmxBroken: 'LoungeFuseBroken',
	},
];

const tasks = [
	{
		type: 'task',
		id: 'fusebox_medbay',
		title: 'Life support fuse failure (medbay)',
		description: 'Life support fuses have blown in medbay.\n\nReplace broken fuses as instructed in Ship knowledge database code SQ-3 or operation manual page 2.2-38.',
		location: 'Upper deck, medbay',
		map: 'upper-6.png',
		mapX: 80,
		mapY: 40,
	},
	{
		type: 'task',
		id: 'fusebox_engineering',
		title: 'Life support fuse failure (engineering)',
		description: 'Life support fuses have blown in engineering.\n\nReplace broken fuses as instructed in Ship knowledge database code SQ-3 or operation manual page 2.2-38.',
		location: 'Upper deck, engineering storage',
		map: 'upper-4.png',
		mapX: 230,
		mapY: 50,
	},
	{
		type: 'task',
		id: 'fusebox_bridge',
		title: 'Life support fuse failure (bridge)',
		description: 'Life support fuses have blown in bridge.\n\nReplace broken fuses as instructed in Ship knowledge database code SQ-3 or operation manual page 2.2-38.',
		location: 'Upper deck, bridge',
		map: 'upper-2.png',
		mapX: 140,
		mapY: 100,
	},
	{
		type: 'task',
		id: 'fusebox_science',
		title: 'Life support fuse failure (science lab)',
		description: 'Life support fuses have blown in science lab.\n\nReplace broken fuses as instructed in Ship knowledge database code SQ-3 or operation manual page 2.2-38.',
		location: 'Lower deck, science lab',
		map: 'lower-13.png',
		mapX: 350,
		mapY: 200,
	},
	{
		type: 'task',
		id: 'fusebox_lounge',
		title: 'Life support fuse failure (celestial lounge)',
		description: 'Life support fuses have blown in celestial lounge.\n\nReplace broken fuses as instructed in Ship knowledge database code SQ-3 or operation manual page 2.2-38.',
		location: 'Upper deck, officer\'s lounge',
		map: 'upper-9.png',
		mapX: 250,
		mapY: 220,
	},
];

boxes.forEach(e => {
	e.status = 'initial';
	e.task = e.id;
	e.fuses = e.config.blowing.map(() => 1);
	e.presets = {
		blow_one: {
			blow: [0]
		},
		blow_all: {
			blow: e.config.blowing.map((e, index) => index)
		},
	};
});

tasks.forEach(e => {
	e.status = 'initial';
	e.calibrationTime = 0;
	e.calibrationCount = 0;
	e.important = false;
});


export default [...boxes, ...tasks];
