const blobs = [];

blobs.push({
	type: 'box',
	id: 'reactor_wiring',
	task: 'reactor_wiring',
	status: 'initial',
	boxType: 'reactor_wiring',
	connected: { },
	config: {
		pins: [4, 14, 15, 17, 18, 27, 22, 23, 24, 10, 9, 25, 11, 8, 7, 5, 6, 12, 13, 19, 16, 26, 20, 21]
	},
	context: {
		code: '...',
	}
});

blobs.push({
	type: 'task',
	id: 'reactor_wiring',
	box: 'reactor_wiring',
	eeType: 'reactor',
	priority: 1,
	eeHealth: 0.15,  // fixes 15%
	status: 'initial',
	calibrationTime: 6*60,
	calibrationCount: 2,
	title: `Reactor vibration crystal stabilator`,
	description: '...',
	description_template: `The reactor vibration crystal that inhibits the vibration reducer prevention from working requires restabilation.
	
	Required stabilation wiring configuration {{code}}. Refer to Ship knowledge database code RVSC-3 or Operations manual page 2.3-1 for instructions.`,
	location: 'Lower deck, science lab',
	map: 'lower-13.png',
	mapX: 250,
	mapY: 180,
});


export default blobs;
