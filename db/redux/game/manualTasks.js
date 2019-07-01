const blobs = [];

/*
 * Two blobs required per manual game:  one 'game' (read by HANSCA) and one 'task' (shown in task list)
 */

blobs.push({
	type: 'game',
	id: 'manual_example',     // NFC tag needs to read "game:<id>"
	task: 'manual_example',   // Reference to 'task' (typically same ID)
	game_config: 'manual',    // Reference to 'game_config', always 'manual'
	status: 'fixed',          // Initially 'fixed'
	config: {
		title: `Example manual task`,   // Title shown on top of HANSCA pages (optional)
		pages: [              // Array of pages of instructions in HTML
			`<p>Perform the following physical tasks:</p>
			<ol>
			<li>Open the maintenance hatch</li>
			<li>Carefully remove the thingamabob from the doohickey</li>
			<li>Turn the knob 9 3/4 turns counter-clockwise</li>
			</ol>
			<img src="images/manual/example_drawing.png">`,
			// Images must be placed in odysseus-HANSCA repo under public/images/manual/

			`<p>Perform the following mental calibration tasks:</p>
			<ol>
			<li>Place a chicken on your head and recite the Song of Time</li>
			</ol>
			<img src="images/manual/example_chicken.jpg">`,
		],
		buttons: [             // Buttons to move to next page, or to mark task complete (last in array), must be of same length as 'pages'
			'Next',
			'Complete',
		],
	},
});
blobs.push({
	type: 'task',
	id: 'manual_example',     // ID of task (typically same as of 'game')
	game: 'manual_example',   // Reference to 'game' ID
	singleUse: true,          // Make this task single-use
	used: false,              // Set to true to keep out of breaking pool until ready (Updated by backend once used - optional)
	eeType: 'none',           // What EE health this is related to (omit for non-EE-bound)
	                          // Values: 'reactor', 'impulse', 'maneuver', 'frontshield', 'rearshield', 'missilesystem', 'beamweapons', 'hull'
	eeHealth: 0.05,           // How much health it fixed (5%)
	status: 'initial',        // Initially 'initial'
	calibrationCount: 0,      // How many calibration slots the task takes (0 for no calibration)
	calibrationTime: 0,       // Calibration time for each slot
	title: `Manual work`,     // Title shown in task list
	description: `Manual labor is needed. Use HANSCA for details.`,  // Description in task list (no HTML, may contain line breaks)
	map: 'lower-7.png',       // Map to display (from odysseus-misc-ui repo)
	mapX: 100,                // Location on map to highlight (see -overlay.png to locate)
	mapY: 200,
});


/*
 * Single instance of 'game_config', requires all config values to be overriden in 'game'.
 */
blobs.push({
	type: 'game_config',
	id: 'manual',
	default: {
		game: 'manual',
		// Other config values must be provided by the box
	},
});

// Manual games
[
	{
		id: 'frontshield_55f_a',
		type: 'game',
		task: 'frontshield_55f_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Frontshield Code Unit Model 55f A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code unit model 55F is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 10 --> Slot 22</li><li>Wires 19 and 15 --> Slot 20</li><li>Wire 11 --> Slot 18</li><li>Wires 13 and 14 --> Slot 15</li><li>Wire 12 --> Slot 14</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Wiring instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'frontshield_55f_b',
		type: 'game',
		task: 'frontshield_55f_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Frontshield Code Unit Model 55f B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code unit model 55F is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 10 --> Slot 24</li><li>Wires 19 and 15 --> Slot 21</li><li>Wire 11 --> Slot 12</li><li>Wires 13 and 14 --> Slot 15</li><li>Wire 12 --> Slot 19</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Wiring instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'frontshield_55f_c',
		type: 'game',
		task: 'frontshield_55f_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Frontshield Code Unit Model 55f C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code unit model 55F is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 10 --> Slot 21</li><li>Wires 19 and 15 --> Slot 19</li><li>Wire 11 --> Slot 16</li><li>Wires 13 and 14 --> Slot 20</li><li>Wire 12 --> Slot 15</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Wiring instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'reactor_battery_472',
		type: 'game',
		task: 'reactor_battery_472',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Reactor Electricity storage battery type 472',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The battery is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-2 for instructions.</p>',
				'<p>When the task is complete, move it to calibration.</p>'
			],
			buttons: [
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'reactor_MG9k',
		type: 'game',
		task: 'reactor_MG9k',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Connect Back-up Reactor MG9k',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The back-up reactor is located in the medbay behind a picture/poster. Connect all the wires to use back-up reactor MG9k</p>',
				'<p>When the task is complete, move it to calibration.</p>'
			],
			buttons: [
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'rearshield_55f_a',
		type: 'game',
		task: 'rearshield_55f_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Rearshield Code Unit Model 55f A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code unit model 55F is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 10 --> Slot 15</li><li>Wires 19 and 15 --> Slot 17</li><li>Wire 11 --> Slot 21</li><li>Wires 13 and 14 --> Slot 22</li><li>Wire 12 --> Slot 18</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Wiring instructions',
				'Next',
				'Calibrate'
			]
		}
	}, {
		id: 'rearshield_55f_b',
		type: 'game',
		task: 'rearshield_55f_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Rearshield Code Unit Model 55f B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code unit model 55F is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 10 --> Slot 14</li><li>Wires 19 and 15 --> Slot 16</li><li>Wire 11 --> Slot 18</li><li>Wires 13 and 14 --> Slot 20</li><li>Wire 12 --> Slot 22</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Wiring instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'rearshield_55f_c',
		type: 'game',
		task: 'rearshield_55f_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Rearshield Code Unit Model 55f C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code unit model 55F is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 10 --> Slot 15</li><li>Wires 19 and 15 --> Slot 17</li><li>Wire 11 --> Slot 19</li><li>Wires 13 and 14 --> Slot 21</li><li>Wire 12 --> Slot 23</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Wiring instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'maneuvering_hsm_11',
		type: 'game',
		task: 'maneuvering_hsm_11',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Maneuvering Hypersensitive Sensor Module 11 Clean-up',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Maneuvering Hypersensitive Sensor Module 11 is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'maneuvering_hsm_12',
		type: 'game',
		task: 'maneuvering_hsm_12',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Maneuvering Hypersensitive Sensor Module 12 Clean-up',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Maneuvering Hypersensitive Sensor Module 12 is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'maneuvering_hsm_13',
		type: 'game',
		task: 'maneuvering_hsm_13',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Maneuvering Hypersensitive Sensor Module 13 Clean-up',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Maneuvering Hypersensitive Sensor Module 13 is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'maneuvering_hsm_14',
		type: 'game',
		task: 'maneuvering_hsm_14',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Maneuvering Hypersensitive Sensor Module 14 Clean-up',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Maneuvering Hypersensitive Sensor Module 14 is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'impulse_hsm_21',
		type: 'game',
		task: 'impulse_hsm_21',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse Engine Hypersensitive Sensor Module 21 Clean-up',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Impulse Engine Hypersensitive Sensor Module 21 is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'impulse_hsm_22',
		type: 'game',
		task: 'impulse_hsm_22',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse Engine Hypersensitive Sensor Module 22 Clean-up',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Impulse Engine Hypersensitive Sensor Module 22 is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'impulse_hsm_23',
		type: 'game',
		task: 'impulse_hsm_23',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse Engine Hypersensitive Sensor Module 23 Clean-up',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Impulse Engine Hypersensitive Sensor Module 23 is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'impulse_hsm_24',
		type: 'game',
		task: 'impulse_hsm_24',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse Engine Hypersensitive Sensor Module 24 Clean-up',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Impulse Engine Hypersensitive Sensor Module 24 is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Next',
				'Calibrate'
			]
		}
	},
].forEach(blob => blobs.push(blob));

// Manual tasks
[
	{
		id: 'frontshield_55f_a',
		type: 'task',
		game: 'frontshield_55f_a',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.15,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 240,
		title: 'Re-coding Frontshield Unit Model 55f A',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'frontshield_55f_b',
		type: 'task',
		game: 'frontshield_55f_b',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.15,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 240,
		title: 'Re-coding Frontshield Unit Model 55f B',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'frontshield_55f_c',
		type: 'task',
		game: 'frontshield_55f_c',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.15,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 240,
		title: 'Re-coding Frontshield Unit Model 55f C',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'reactor_battery_472',
		type: 'task',
		game: 'reactor_battery_472',
		singleUse: true,
		used: false,
		eeType: 'reactor',
		eeHealth: 0.3,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 1080,
		title: 'Change Reactor Electricity Storage Battery Type 472',
		description: 'Manual labor is needed. The battery is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'reactor_MG9k',
		type: 'task',
		game: 'reactor_MG9k',
		singleUse: true,
		used: false,
		eeType: 'reactor',
		eeHealth: 0.4,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 2220,
		title: 'Connect Back-up Reactor MG9k',
		description: 'Manual labor is needed. The back-up reactor MG9k is located in the medbay behind a picture/poster. Use HANSCA repair.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'rearshield_55f_a',
		type: 'task',
		game: 'rearshield_55f_a',
		singleUse: false,
		used: false,
		eeType: 'rearshield',
		eeHealth: 0.15,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 240,
		title: 'Re-coding Rearshield Unit Model 55f A',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'rearshield_55f_b',
		type: 'task',
		game: 'rearshield_55f_b',
		singleUse: false,
		used: false,
		eeType: 'rearshield',
		eeHealth: 0.15,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 240,
		title: 'Re-coding Rearshield Unit Model 55f B',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'rearshield_55f_c',
		type: 'task',
		game: 'rearshield_55f_c',
		singleUse: false,
		used: false,
		eeType: 'rearshield',
		eeHealth: 0.15,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 240,
		title: 'Re-coding Rearshield Unit Model 55f C',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'maneuvering_hsm_11',
		type: 'task',
		game: 'maneuvering_hsm_1',
		singleUse: true,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 480,
		title: 'Maneuvering Hypersensitive Sensor Module 11 Clean-up',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'maneuvering_hsm_12',
		type: 'task',
		game: 'maneuvering_hsm_2',
		singleUse: true,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 480,
		title: 'Maneuvering Hypersensitive Sensor Module 12 Clean-up',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'maneuvering_hsm_13',
		type: 'task',
		game: 'maneuvering_hsm_3',
		singleUse: true,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 480,
		title: 'Maneuvering Hypersensitive Sensor Module 13 Clean-up',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'maneuvering_hsm_14',
		type: 'task',
		game: 'maneuvering_hsm_4',
		singleUse: true,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 480,
		title: 'Maneuvering Hypersensitive Sensor Module 14 Clean-up',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Enineering storage space',
		map: 'upper-10.png',
		mapX: 325,
		mapY: 400
	},
	{
		id: 'impulse_hsm_21',
		type: 'task',
		game: 'impulse_hsm_21',
		singleUse: true,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 900,
		title: 'Impulse Engine Hypersensitive Sensor Module 21 Clean-up',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Bridge',
		map: 'upper-2.png',
		mapX: 225,
		mapY: 300
	},
	{
		id: 'impulse_hsm_22',
		type: 'task',
		game: 'impulse_hsm_22',
		singleUse: true,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 900,
		title: 'Impulse Engine Hypersensitive Sensor Module 22 Clean-up',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Bridge',
		map: 'upper-2.png',
		mapX: 225,
		mapY: 300
	},
	{
		id: 'impulse_hsm_23',
		type: 'task',
		game: 'impulse_hsm_23',
		singleUse: true,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 900,
		title: 'Impulse Engine Hypersensitive Sensor Module 23 Clean-up',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Bridge',
		map: 'upper-2.png',
		mapX: 225,
		mapY: 300
	},
	{
		id: 'impulse_hsm_24',
		type: 'task',
		game: 'impulse_hsm_24',
		singleUse: true,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 900,
		title: 'Impulse Engine Hypersensitive Sensor Module 24 Clean-up',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in the medbay. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Medbay',
		map: 'upper-6.png',
		mapX: 60,
		mapY: 50
	}
].forEach(blob => blobs.push(blob));

export default blobs;
