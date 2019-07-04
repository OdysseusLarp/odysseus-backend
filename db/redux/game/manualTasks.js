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
			title: 'Frontshield Code Unit Model 55f A, 55f A (F)',
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
			title: 'Frontshield Code Unit Model 55f B, 55f B (F)',
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
			title: 'Frontshield Code Unit Model 55f C, 55f C (F)',
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
			title: 'Reactor Electricity storage battery type 472, B472',
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
			title: 'Connect Back-up Reactor MG9k, MG9k',
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
			title: 'Rearshield Code Unit Model 55f A, 55f A (R)',
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
			title: 'Rearshield Code Unit Model 55f B, 55f B (R)',
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
			title: 'Rearshield Code Unit Model 55f C, 55f C (R)',
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
			title: 'Maneuvering Hypersensitive Sensor Module 11 Clean-up, HSM 11',
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
			title: 'Maneuvering Hypersensitive Sensor Module 12 Clean-up, HSM 12',
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
			title: 'Maneuvering Hypersensitive Sensor Module 13 Clean-up, HSM 13',
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
			title: 'Maneuvering Hypersensitive Sensor Module 14 Clean-up, HSM 14',
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
			title: 'Impulse Engine Hypersensitive Sensor Module 21 Clean-up, HSM 21',
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
			title: 'Impulse Engine Hypersensitive Sensor Module 22 Clean-up, HSM 22',
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
			title: 'Impulse Engine Hypersensitive Sensor Module 23 Clean-up, HSM 23',
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
			title: 'Impulse Engine Hypersensitive Sensor Module 24 Clean-up, HSM 24',
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
	{
		id: 'beam_TS',
		type: 'game',
		task: 'beam_TS',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Beam weapon targeting system cooling fan broken, TS',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Beam weapon targeting system is located in the medbay. Refer to ESS Odysseus Operations Handbook page 1-22 for more detailed instructions.</p>',
				'<p>Change the broken cooling fan with fixed one (should be in the spare parts box) and fix the broken one to use it again.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'missile_GS_F1',
		type: 'game',
		task: 'missile_GS_F1',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Missile weapon guidance system fault 1, cooling fan jammed, GS F1',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Missile weapon guidance system is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.7-31 for more detailed instructions.</p>',
				'<p>Check if the fan really is jammed by opening the black hatch. If the fan spins, spin it few times and you are good to go, otherwise open it and clear the jam.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'missile_GS_F2',
		type: 'game',
		task: 'missile_GS_F2',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Missile weapon guidance system fault 2, overheating of the low yield araknium fuel rod, GS F2',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Missile weapon guidance system is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.7-31 for more detailed instructions.</p>',
				'<p>Change the fuel rod and let the other rod rest.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'beam_FM',
		type: 'game',
		task: 'beam_FM',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Beam weapon beam frequency modulator, fried up processor, FM',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Beam weapon beam freaquency modulator is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.2-25 for more detailed instructions.</p>',
				'<p>Change the fried up processor and recalibrate the old processor for further use.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'beam_MC',
		type: 'game',
		task: 'beam_MC',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Beam weapon memory circulator, memory overflow, MC',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Beam weapon memory circulator is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 1-38 for more detailed instructions.</p>',
				'<p>Change the slots from violet to green or from green to violet depending on which slot the memories are in at the moment.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'maneuvering_SDF',
		type: 'game',
		task: 'maneuvering_SDF',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Maneuvering thrusters space dust filter clean-up, SDF',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Maneuvering thrusters space dust filter is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for more detailed instructions.</p>',
				'<p>Change the space dust filter carefully and clean the old one for further use. DO NOT SHAKE IT IN ANY CIRCUMSTANCES! KINETIC DISASSEMBLY MAY BLOW IT UP!</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'maneuvering_LRC',
		type: 'game',
		task: 'maneuvering_LRC',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Maneuvering thruster spectral dampener autocontrol level recharge conductor, re-leveling, LRC',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Maneuvering thruster spectral dampener autocontrol level recharge conductor is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.8-31 for more detailed instructions.</p>',
				'<p>Move the spectral dampener to the next slot (one below). If the slot is the lowest one insert the spectral dampener to the top one.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'impulse_DEM',
		type: 'game',
		task: 'impulse_DEM',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse engine subspace DEM-particle disruptor, DEM-particle neutralization, DEM',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Impulse engine subspace DEM-particle disruptor is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.5-4 for more detailed instructions.</p>',
				'<p>Replace the subpsace DEM-particle disruptor with neutralized DEM-particle disruptor. Neutralize the changed disruptor from DEM-particles for further use.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'frontshield_EE_a',
		type: 'game',
		task: 'frontshield_EE_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Front shield reactor encryption enhancement A, re-encrypting (re-wiring) the shield reactor, EE A (F)',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Shield reactor encryption enhancement is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Red -- Yellow</li><li>Blue -- Red</li><li>Gray -- Blue</li><li>Yellow -- Gray</li><li>Black -- Black</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'frontshield_EE_b',
		type: 'game',
		task: 'frontshield_EE_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Front shield reactor encryption enhancement B, re-encrypting (re-wiring) the shield reactor, EE B (F)',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Shield reactor encryption enhancement is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Red -- Blue</li><li>Blue -- Gray</li><li>Gray -- Black</li><li>Yellow -- Red</li><li>Black -- Yellow</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'frontshield_EE_c',
		type: 'game',
		task: 'frontshield_EE_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Front shield reactor encryption enhancement C, re-encrypting (re-wiring) the shield reactor, EE C (F)',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Shield reactor encryption enhancement is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Red -- Black</li><li>Blue -- Gray</li><li>Gray -- Blue</li><li>Yellow -- Yellow</li><li>Black -- Red</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'rearshield_EE_a',
		type: 'game',
		task: 'rearshield_EE_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Rear shield reactor encryption enhancement A, re-encrypting (re-wiring) the shield reactor, EE A (R)',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Shield reactor encryption enhancement is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Red -- Red</li><li>Blue -- Blue</li><li>Gray -- Gray</li><li>Yellow -- Yellow</li><li>Black -- Black</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'rearshield_EE_b',
		type: 'game',
		task: 'rearshield_EE_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Rear shield reactor encryption enhancement B, re-encrypting (re-wiring) the shield reactor, EE B (R)',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Shield reactor encryption enhancement is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Red -- Gray</li><li>Blue -- Black</li><li>Gray -- Red</li><li>Yellow -- Gray</li><li>Black -- Blue</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'rearshield_EE_c',
		type: 'game',
		task: 'rearshield_EE_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Rear shield reactor encryption enhancement C, re-encrypting (re-wiring) the shield reactor, EE C (R)',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Shield reactor encryption enhancement is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Red -- Yellow</li><li>Blue -- Red</li><li>Gray -- Black</li><li>Yellow -- Blue</li><li>Black -- Gray</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	{
		id: 'impulse_ADS',
		type: 'game',
		task: 'impulse_ADS',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse Antilepton Direction Stabilator, ADS',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Impulse Antilepton Direction Stabilator is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.2-10 for more detailed instructions.</p>',
				'<p>There are two buttons on the opposite sides of the crew bar counter. These buttons needs to be pressed or pulled at the same time to stabilize the antilepton direction. If the buttons are pressed down, you need to pull them up and vice versa.</p>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Fixing instructions',
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
		title: 'Re-coding Frontshield Unit Model 55f A, 55f A (F)',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Engineering Technical Space',
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
		title: 'Re-coding Frontshield Unit Model 55f B, 55f B (F)',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Engineering Technical Space',
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
		title: 'Re-coding Frontshield Unit Model 55f C, 55f C (F)',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Engineering Technical Space',
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
		title: 'Change Reactor Electricity Storage Battery Type 472, B 472',
		description: 'Manual labor is needed. The battery is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair.',
		location: 'Upper deck, Engineering Technical Space',
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
		title: 'Connect Back-up Reactor MG9k, MG9k',
		description: 'Manual labor is needed. The back-up reactor MG9k is located in the medbay behind a picture/poster. Use HANSCA repair.',
		location: 'Upper deck, Engineering Technical Space',
		map: 'upper-6.png',
		mapX: 20,
		mapY: 150
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
		title: 'Re-coding Rearshield Unit Model 55f A, 55f A (R)',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Engineering Technical Space',
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
		title: 'Re-coding Rearshield Unit Model 55f B, 55f B (R)',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Engineering Technical Space',
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
		title: 'Re-coding Rearshield Unit Model 55f C, 55f C (R)',
		description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
		location: 'Upper deck, Engineering Technical Space',
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
		eeType: 'maneuver',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 480,
		title: 'Maneuvering Hypersensitive Sensor Module 11 Clean-up, HSM 11',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Engineering Technical Space',
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
		eeType: 'maneuver',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 480,
		title: 'Maneuvering Hypersensitive Sensor Module 12 Clean-up, HSM 12',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Engineering Technical Space',
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
		eeType: 'maneuver',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 480,
		title: 'Maneuvering Hypersensitive Sensor Module 13 Clean-up, HSM 13',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Engineering Technical Space',
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
		eeType: 'maneuver',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 480,
		title: 'Maneuvering Hypersensitive Sensor Module 14 Clean-up, HSM 14',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Engineering Technical Space',
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
		title: 'Impulse Engine Hypersensitive Sensor Module 21 Clean-up, HSM 21',
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
		title: 'Impulse Engine Hypersensitive Sensor Module 22 Clean-up, HSM 22',
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
		title: 'Impulse Engine Hypersensitive Sensor Module 23 Clean-up. HSM 23',
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
		title: 'Impulse Engine Hypersensitive Sensor Module 24 Clean-up, HSM 24',
		description: 'Manual labor is needed. The Hypersensitive Sensor Module is located in the medbay. Refer to ESS Odysseus Operations Handbook page 2.5-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Medbay',
		map: 'upper-6.png',
		mapX: 60,
		mapY: 50
	},
	{
		id: 'beam_TS',
		type: 'task',
		game: 'beam_TS',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.16,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 100,
		title: 'Beam weapon targeting system cooling fan broken, TS',
		description: 'Manual labor is needed. Beam weapon targeting system is located in the medbay. Refer to ESS Odysseus Operations Handbook page 1-22 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, Medbay',
		map: 'upper-6.png',
		mapX: 60,
		mapY: 50
	},
	{
		id: 'missile_GS_F1',
		type: 'task',
		game: 'missile_GS_F1',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 1200,
		title: 'Missile weapon guidance system fault 1, cooling fan jammed, GS F1',
		description: 'Manual labor is needed. Missile weapon guidance system is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.7-13 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Engineering Technical Space',
		map: 'lower-13.png',
		mapX: 405,
		mapY: 200
	},
	{
		id: 'missile_GS_F2',
		type: 'task',
		game: 'missile_GS_F2',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 1200,
		title: 'Missile weapon guidance system fault 2, overheating of the low yield araknium fuel rod, GS F2',
		description: 'Manual labor is needed. Missile weapon guidance system is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.7-13 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Engineering Technical Space',
		map: 'lower-13.png',
		mapX: 405,
		mapY: 200
	},
	{
		id: 'beam_FM',
		type: 'task',
		game: 'beam_FM',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.17,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 1600,
		title: 'Beam weapon beam frequency modulator, fried up processor, FM',
		description: 'Manual labor is needed. Beam weapon beam freaquency modulator is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.2-25 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Engineering Technical Space',
		map: 'lower-13.png',
		mapX: 405,
		mapY: 200
	},
	{
		id: 'beam_MC',
		type: 'task',
		game: 'beam_MC',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.17,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 1600,
		title: 'Beam weapon memory circulator, memory overflow, MC',
		description: 'Manual labor is needed. Beam weapon memory circulator is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 1-38 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Engineering Technical Space',
		map: 'lower-13.png',
		mapX: 405,
		mapY: 200
	},
	{
		id: 'maneuvering_SDF',
		type: 'task',
		game: 'maneuvering_SDF',
		singleUse: false,
		used: false,
		eeType: 'maneuver',
		eeHealth: 0.26,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 2600,
		title: 'Maneuvering thrusters space dust filter clean-up, SDF',
		description: 'Manual labor is needed. Maneuvering thrusters space dust filter is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Engineering Technical Space',
		map: 'lower-13.png',
		mapX: 405,
		mapY: 200
	},
	{
		id: 'maneuvering_LRC',
		type: 'task',
		game: 'maneuvering_LRC',
		singleUse: false,
		used: false,
		eeType: 'maneuver',
		eeHealth: 0.20,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 3600,
		title: 'Maneuvering thruster spectral dampener autocontrol level recharge conductor, re-leveling, LRC',
		description: 'Manual labor is needed. Maneuvering thruster spectral dampener autocontrol level recharge conductor is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.8-31 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Engineering Technical Space',
		map: 'lower-13.png',
		mapX: 405,
		mapY: 200
	},
	{
		id: 'impulse_DEM',
		type: 'task',
		game: 'impulse_DEM',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 200,
		title: 'Maneuvering thruster spectral dampener autocontrol level recharge conductor, re-leveling, DEM',
		description: 'Manual labor is needed. Maneuvering thruster spectral dampener autocontrol level recharge conductor is located in engineering technical space. Refer to ESS Odysseus Operations Handbook page 2.8-31 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Engineering Technical Space',
		map: 'lower-13.png',
		mapX: 405,
		mapY: 200
	},
	{
		id: 'frontshield_EE_a',
		type: 'task',
		game: 'frontshield_EE_a',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 1100,
		title: 'Front shield reactor encryption enhancement A, re-encrypting (re-wiring) the shield reactor, EE A (F)',
		description: 'Manual labor is needed. Shield reactor encryption enhancement is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Armory',
		map: 'lower-12.png',
		mapX: 325,
		mapY: 425
	},
	{
		id: 'frontshield_EE_b',
		type: 'task',
		game: 'frontshield_EE_b',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 1100,
		title: 'Front shield reactor encryption enhancement B, re-encrypting (re-wiring) the shield reactor, EE B (F)',
		description: 'Manual labor is needed. Shield reactor encryption enhancement is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Armory',
		map: 'lower-12.png',
		mapX: 325,
		mapY: 425
	},
	{
		id: 'frontshield_EE_c',
		type: 'task',
		game: 'frontshield_EE_c',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 1100,
		title: 'Front shield reactor encryption enhancement C, re-encrypting (re-wiring) the shield reactor, EE C (F)',
		description: 'Manual labor is needed. Shield reactor encryption enhancement is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Armory',
		map: 'lower-12.png',
		mapX: 325,
		mapY: 425
	},
	{
		id: 'rearshield_EE_a',
		type: 'task',
		game: 'rearshield_EE_a',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 1100,
		title: 'Rear shield reactor encryption enhancement A, re-encrypting (re-wiring) the shield reactor, EE A (R)',
		description: 'Manual labor is needed. Shield reactor encryption enhancement is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Armory',
		map: 'lower-12.png',
		mapX: 325,
		mapY: 425
	},
	{
		id: 'rearshield_EE_b',
		type: 'task',
		game: 'rearshield_EE_b',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 1100,
		title: 'Rear shield reactor encryption enhancement B, re-encrypting (re-wiring) the shield reactor, EE B (R)',
		description: 'Manual labor is needed. Shield reactor encryption enhancement is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Armory',
		map: 'lower-12.png',
		mapX: 325,
		mapY: 425
	},
	{
		id: 'rearshield_EE_c',
		type: 'task',
		game: 'rearshield_EE_c',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 1100,
		title: 'Rear shield reactor encryption enhancement C, re-encrypting (re-wiring) the shield reactor, EE C (R)',
		description: 'Manual labor is needed. Shield reactor encryption enhancement is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.2-16 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Armory',
		map: 'lower-12.png',
		mapX: 325,
		mapY: 425
	},
	{
		id: 'impulse_ADS',
		type: 'task',
		game: 'impulse_ADS',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 6,
		calibrationTime: 40,
		title: 'Impulse Antilepton Direction Stabilator, ADS',
		description: 'Manual labor is needed. Impulse Antilepton Direction Stabilator is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.2-10 for more detailed instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, Crew bar',
		map: 'lower-11.png',
		mapX: 130,
		mapY: 200
	},
].forEach(blob => blobs.push(blob));

export default blobs;
