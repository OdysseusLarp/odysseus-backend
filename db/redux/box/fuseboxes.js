const boxes = [
	{
		type: 'box',
		id: 'fusebox_medbay',
		config: {
			blowing: [4, 15, 18, 22, 24,  9, 11, 7,  6, 13, 16, 20],
			measure: [14, 17, 27, 23, 10, 25,  8, 5, 12, 19, 26, 21],
		},
	},
	{
		type: 'box',
		id: 'fusebox_engineering',
		config: {
			blowing: [4, 15, 18, 22, 24,  9, 11, 7,  6, 13, 16, 20],
			measure: [14, 17, 27, 23, 10, 25,  8, 5, 12, 19, 26, 21],
		},
	},
	{
		type: 'box',
		id: 'fusebox_bridge',
		config: {
			blowing: [4, 15, 18, 22, 24,  9, 11, 7,  6, 13, 16, 20],
			measure: [14, 17, 27, 23, 10, 25,  8, 5, 12, 19, 26, 21],
		},
	},
	{
		type: 'box',
		id: 'fusebox_science',
		config: {
			blowing: [4, 15, 18, 22, 24,  9, 11, 7,  6, 13, 16, 20],
			measure: [14, 17, 27, 23, 10, 25,  8, 5, 12, 19, 26, 21],
		},
	},
	{
		type: 'box',
		id: 'fusebox_lounge',
		config: {
			blowing: [4, 15, 18, 22, 24,  9, 11, 7,  6, 13, 16, 20],
			measure: [14, 17, 27, 23, 10, 25,  8, 5, 12, 19, 26, 21],
		},
	},
];

const tasks = [
	{
		type: 'task',
		id: 'fusebox_medbay',
		title: 'Fuses blown (medbay)',
		description: 'Fuses have blown in medbay.',
		map: 'fusebox_medbay.png',
	},
	{
		type: 'task',
		id: 'fusebox_engineering',
		title: 'Fuses blown (engineering)',
		description: 'Fuses have blown in engineering room.',
		map: 'fusebox_engineering.png',
	},
	{
		type: 'task',
		id: 'fusebox_bridge',
		title: 'Fuses blown (bridge)',
		description: 'Fuses have blown in bridge.',
		map: 'fusebox_bridge.png',
	},
	{
		type: 'task',
		id: 'fusebox_science',
		title: 'Fuses blown (science lab)',
		description: 'Fuses have blown in science lab.',
		map: 'fusebox_science.png',
	},
	{
		type: 'task',
		id: 'fusebox_lounge',
		title: 'Fuses blown (officer\'s lounge)',
		description: 'Fuses have blown in officer\'s lounge.',
		map: 'fusebox_lounge.png',
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
