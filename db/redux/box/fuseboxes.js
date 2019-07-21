const boxes = [{
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
];

const tasks = [
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
