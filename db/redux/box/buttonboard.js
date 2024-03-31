const blobs = [];

/*
 * This is the "physical" box that Raspberry Pi connects to and updated using the
 * connected-wires.py box logic.
 */
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
		12: [],
		13: [],
		14: [],
		15: [],
		16: [],
		17: [],
		18: [],
		19: [],
		20: [],
		21: [],
	},
	config: {
		pins: [
			4, // FS01, index=0
			14, // FS02, index=1
			15, // FS03, index=2
			17, // FS04, index=3
			18, // FS05, index=4
			27, // RS01, index=5
			22, // RS02, index=6
			23, // RS03, index=7
			24, // RS04, index=8
			10, // RS05, index=9
			9, // Switch DOWN, index=10
			25, // Switch UP, index=11
			11, // M01, index=12
			8, // M02, index=13
			7, // M03, index=14
			5, // M04, index=15
			6, // BWMS-01, index=16
			12, // BWMS-02, index=17
			19, // B01, index=18
			16, // B02, index=19
			26, // B03, index=20
			20, // B04, index=21
		],
	},
};
blobs.push(box);

/*
 * All following boxes are "logical" boxes which aren't modified through the API, but rather
 * using rules logic in rules/buttonboard.js based on values from the 'buttonboard' box.
 * The engineering tasks are bound to these "logical" boxes instead of the physical one.
 */

// Front shield tasks

for (let i = 0; i < 5; i++) {
	const code = `FS0${i + 1}`;
	const id = `frontshield_btn_${code}`;

	blobs.push({
		type: 'box',
		id,
		task: id,
		status: 'fixed',
		boxType: 'shield_button',
		buttonIndex: i, // 0 - 4
		context: {
			// assume all buttons to be in center position initially
			//  -->  measuredValue is current value when 'fixed' (unless has been changed manually afterwards)
			code: '79-79-79-79',
			measuredValue: 0, // -1 0 1 of measured button
		},
	});
	blobs.push({
		type: 'task',
		id,
		box: id,
		eeType: 'frontshield',
		eeHealth: 0.07, // fixes 7%
		status: 'initial',
		calibrationTime: 5 * 60,
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

for (let i = 0; i < 5; i++) {
	const code = `RS0${i + 1}`;
	const id = `rearshield_btn_${code}`;

	blobs.push({
		type: 'box',
		id,
		task: id,
		status: 'fixed',
		boxType: 'shield_button',
		buttonIndex: i + 5, // 5 - 9
		context: {
			// assume all buttons to be in center position initially
			//  -->  measuredValue is current value when 'fixed' (unless has been changed manually afterwards)
			code: '79-79-79-79',
			measuredValue: 0, // -1 0 1 of measured button
		},
	});
	blobs.push({
		type: 'task',
		id,
		box: id,
		eeType: 'rearshield',
		eeHealth: 0.07, // fixes 7%
		status: 'initial',
		calibrationTime: 5 * 60,
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

// Missile tasks

for (let i = 0; i < 4; i++) {
	const code = `M0${i + 1}`;
	const id = `missile_btn_${code}`;

	blobs.push({
		type: 'box',
		id,
		task: id,
		status: 'fixed',
		boxType: 'missile_button',
		buttonIndex: i + 12, // 12 - 15
		context: {
			// assume all buttons to be off initially
			//  -->  measuredValue is current value when 'fixed' (unless has been changed manually afterwards)
			initiationPoint: 1,
			activationInterval: 2,
			measuredValue: 0, // 0 1 of measured button
		},
	});
	blobs.push({
		type: 'task',
		id,
		box: id,
		eeType: 'missilesystem',
		eeHealth: 0.07, // fixes 7%
		status: 'initial',
		calibrationTime: 5 * 60,
		calibrationCount: 1,
		title: `Missile system frequency modulator ${code}`,
		description: '...',
		description_template: `Missile system frequency modulator ${code} requires frequency modulation recalibration. Recalibrate to Initiation Point {{initiationPoint}} and Activation Interval {{activationInterval}}. Refer to Ship knowledge database code MSSS-19 or Operations manual page 2.10-5 for instructions.`,
		location: 'Upper deck, corridor',
		map: 'upper-6.png',
		mapX: 420,
		mapY: 60,
	});
}

// BWMS tasks
// 01 = missile, 02 = beam weapons

for (let i = 0; i < 2; i++) {
	const code = `BWMS-0${i + 1}`;
	const id = i == 0 ? `missile_btn_${code}` : `beamweapons_btn_${code}`;

	blobs.push({
		type: 'box',
		id,
		task: id,
		status: 'fixed',
		boxType: 'bwms_button',
		buttonIndex: 16 + i, // 16, 17
		context: {
			code: 1,
			measuredValue: 0,
		},
	});
	blobs.push({
		type: 'task',
		id,
		box: id,
		eeType: i == 0 ? 'missilesystem' : 'beamweapons',
		eeHealth: 0.07, // fixes 7%
		status: 'initial',
		calibrationTime: 5 * 60,
		calibrationCount: 1,
		title: `Beam and missile guidance controls ${code}`,
		description: '...',
		description_template: `Beam Weapons Missile System guidance matrix ${code} requires synchronization to pattern {{code}}. Refer to Ship knowledge database code TRS-18 or Operations manual page 2.9-9 for instructions.`,
		location: 'Upper deck, corridor',
		map: 'upper-6.png',
		mapX: 420,
		mapY: 60,
	});
}

export default blobs;
