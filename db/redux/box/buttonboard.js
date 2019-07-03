const blobs = [];

const box = {
	type: 'box',
	id: 'buttonboard',
	connected: {
		0: [],
		1: [],
		2: [],
		3: [],
		4: [],
		5: [],
		6: [],
		7: [],
		8: [],
		9: [],
		10: [],
		11: [],
	},
	config: {
		pins: [4, 14, 15, 17, 18, 27, 22, 23, 24, 10, 9, 25]
	}
};
blobs.push(box);


// Front shield tasks

for (let i=0; i < 5; i++) {
	const code = `FS0${i+1}`;
	const id = `frontshield_btn_${code}`;

	blobs.push({
		type: 'box',
		id,
		task: id,
		status: 'fixed',
		boxType: 'shield_button',
		buttonIndex: i,
		context: {
			// assume all buttons to be in center position initially
			//  -->  measuredValue is current value when 'fixed' (unless has been changed manually afterwards)
			code: '79-79-79-79',
			measuredValue: 0,   // -1 0 1 of measured button
		},
	});
	blobs.push({
		type: 'task',
		id,
		box: id,
		eeType: 'frontshield',
		eeHealth: 0.07,  // fixes 7%
		status: 'initial',
		calibrationTime: 5*60,
		calibrationCount: 1,
		title: `Front shield recalibration ${code}`,
		description: '...',
		description_template: `Front shield generator ${code} needs to be recalibrated for optimal performance. New optimal state is {{code}}. Refer to Ship knowledge database code FSB-38 or Operations manual page 2.2-4 for instructions.`,
		location: 'Upper deck, corridor',
		map: 'upper-6.png',
		mapX: 420,
		mapY: 60,
	});
}

// Rear shield tasks

for (let i=0; i < 5; i++) {
	const code = `RS0${i+1}`;
	const id = `rearshield_btn_${code}`;

	blobs.push({
		type: 'box',
		id,
		task: id,
		status: 'fixed',
		boxType: 'shield_button',
		buttonIndex: i+5,
		context: {
			// assume all buttons to be in center position initially
			//  -->  measuredValue is current value when 'fixed' (unless has been changed manually afterwards)
			code: '79-79-79-79',
			measuredValue: 0,   // -1 0 1 of measured button
		},
	});
	blobs.push({
		type: 'task',
		id,
		box: id,
		eeType: 'rearshield',
		eeHealth: 0.07,  // fixes 7%
		status: 'initial',
		calibrationTime: 5*60,
		calibrationCount: 1,
		title: `Rear shield recalibration ${code}`,
		description: '...',
		description_template: `Rear shield generator ${code} needs to be recalibrated for optimal performance. New optimal state is {{code}}. Refer to Ship knowledge database code FSB-38 or Operations manual page 2.2-4 for instructions.`,
		location: 'Upper deck, corridor',
		map: 'upper-6.png',
		mapX: 420,
		mapY: 60,
	});
}


export default blobs;
