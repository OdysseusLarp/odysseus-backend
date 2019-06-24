const boxes = [
	{
		type: 'box',
		id: 'fusebox_medbay',
		config: {
			blowing: [ 4, 15, 18, 22, 24,  9, 11, 7],
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
			blowing: [ 4, 15, 18, 22, 24,  9, 11, 7],
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
			blowing: [ 4, 15, 18, 22, 24,  9, 11, 7],
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
			blowing: [ 4, 15, 18, 22, 24,  9, 11, 7],
			measure: [14, 17, 27, 23, 10, 25,  8, 5],
		},
		dmxFuse: 6,
		dmxFixed: 'LoungeFuseFixed',
		dmxBroken: 'LoungeFuseBroken',
	},
];

// FIXME: Update maps to final versions
// FIXME: Update texts to refer to life support
const tasks = [
	{
		type: 'task',
		id: 'fusebox_medbay',
		title: 'Fuses blown (medbay)',
		description: 'Fuses have blown in medbay.',
		location: 'Upper deck, medbay',
		map: 'upper-6.png',
		mapX: 120,  // FIXME: correct coordinates
		mapY: 320,
	},
	{
		type: 'task',
		id: 'fusebox_engineering',
		title: 'Fuses blown (engineering)',
		description: 'Fuses have blown in engineering room.',
		location: 'Upper deck, engineering storage',
		map: 'upper-4.png',
		mapX: 230,
		mapY: 50,
	},
	{
		type: 'task',
		id: 'fusebox_bridge',
		title: 'Fuses blown (bridge)',
		description: 'Fuses have blown in bridge.',
		location: 'Upper deck, bridge',
		map: 'upper-2.png',
		mapX: 180,  // FIXME: correct coordinate
		mapY: 375,
	},
	{
		type: 'task',
		id: 'fusebox_science',
		title: 'Fuses blown (science lab)',
		description: 'Fuses have blown in science lab.',
		location: 'Lower deck, science lab',
		map: 'lower-13.png',
		mapX: 350,
		mapY: 200,
	},
	{
		type: 'task',
		id: 'fusebox_lounge',
		title: 'Fuses blown (officer\'s lounge)',
		description: 'Fuses have blown in officer\'s lounge.',
		location: 'Upper deck, officer\'s lounge',
		map: 'upper-9.png',
		mapX: 250,  // FIXME: correct coordinate
		mapY: 300,
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
