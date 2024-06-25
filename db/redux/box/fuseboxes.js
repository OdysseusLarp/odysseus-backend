const boxes = [
	{
		type: 'box',
		id: 'fusebox_medbay',
		config: {
			blowing: [4, 15, 18, 22, 24, 9, 11, 7],
			measure: [14, 17, 27, 23, 10, 25, 8, 5],
		},
		dmxFuse: 5, // Which fuse index triggers the following DMX events (optional)
		dmxFuseFixed: 'MedbayFuseFixed',
		dmxFuseBroken: 'MedbayFuseBroken',
	},
	{
		type: 'box',
		id: 'fusebox_engineering',
		config: {
			blowing: [4, 15, 18, 22, 24, 9, 11, 7],
			measure: [14, 17, 27, 23, 10, 25, 8, 5],
		},
		dmxFuse: 7,
		dmxFuseFixed: 'EngineeringFuseFixed',
		dmxFuseBroken: 'EngineeringFuseBroken',
	},
	{
		type: 'box',
		id: 'fusebox_bridge',
		config: {
			blowing: [4, 15, 18, 22, 24, 9, 11, 7, 6, 13, 16, 20],
			measure: [14, 17, 27, 23, 10, 25, 8, 5, 12, 19, 26, 21],
		},
		dmxFuse: 4,
		dmxFuseFixed: 'BridgeFuseFixed',
		dmxFuseBroken: 'BridgeFuseBroken',
	},
	{
		type: 'box',
		id: 'fusebox_science',
		config: {
			blowing: [4, 15, 18, 22, 24, 9, 11, 7],
			measure: [14, 17, 27, 23, 10, 25, 8, 5],
		},
		dmxFuse: 1,
		dmxFuseFixed: 'ScienceFuseFixed',
		dmxFuseBroken: 'ScienceFuseBroken',
	},
	{
		type: 'box',
		id: 'fusebox_lounge',
		config: {
			blowing: [4, 15, 18, 22, 24, 9, 11, 7],
			measure: [14, 17, 27, 23, 10, 25, 8, 5],
		},
		dmxFuse: 6,
		dmxFuseFixed: 'LoungeFuseFixed',
		dmxFuseBroken: 'LoungeFuseBroken',
	},
];

const tasks = [
	{
		type: 'task',
		id: 'fusebox_medbay',
		title: 'Life support fuse failure (medbay)',
		description:
			'Life support fuses have blown in medbay.\n\nReplace broken fuses as instructed in Ship knowledge database code SQ-3 or operation manual page 2.2-38.',
		location: 'Upper deck, medbay',
		map: 'deck2',
		mapX: 135,
		mapY: 1350,
		mapPosX: 100,
		mapPosY: 1280,
	},
	{
		type: 'task',
		id: 'fusebox_engineering',
		title: 'Life support fuse failure (engineering)',
		description:
			'Life support fuses have blown in engineering.\n\nReplace broken fuses as instructed in Ship knowledge database code SQ-3 or operation manual page 2.2-38.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 730,
		mapY: 1890,
	},
	{
		type: 'task',
		id: 'fusebox_bridge',
		title: 'Life support fuse failure (bridge)',
		description:
			'Life support fuses have blown in bridge.\n\nReplace broken fuses as instructed in Ship knowledge database code SQ-3 or operation manual page 2.2-38.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 200,
		mapY: 1090,
	},
	{
		type: 'task',
		id: 'fusebox_science',
		title: 'Life support fuse failure (science lab)',
		description:
			'Life support fuses have blown in science lab.\n\nReplace broken fuses as instructed in Ship knowledge database code SQ-3 or operation manual page 2.2-38.',
		location: 'Upper deck, science lab',
		map: 'deck2',
		mapX: 1160,
		mapY: 770,
	},
	{
		type: 'task',
		id: 'fusebox_lounge',
		title: 'Life support fuse failure (armory)',
		description:
			'Life support fuses have blown in armory.\n\nReplace broken fuses as instructed in Ship knowledge database code SQ-3 or operation manual page 2.2-38.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 500,
		mapY: 1600,
	},
];

boxes.forEach(e => {
	e.status = 'initial';
	e.task = e.id;
	e.fuses = e.config.blowing.map(() => 1);
	e.presets = {
		blow_one: {
			blow: [0],
		},
		blow_all: {
			blow: e.config.blowing.map((e, index) => index),
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
