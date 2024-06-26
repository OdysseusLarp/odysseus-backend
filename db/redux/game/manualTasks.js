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
		id: 'hull_5fv6s_a',
		type: 'game',
		task: 'hull_5fv6s_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Argon quantum shift booster switchboard 5Fv6S A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to reroute the power with argon quantum shift booster switchboard 5Fv6S, change the wires into different slots to re-code the system.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A --> Slot 3</li><li>Wire B --> Slot C</li></ul>',
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
		id: 'hull_5fv6s_b',
		type: 'game',
		task: 'hull_5fv6s_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Argon quantum shift booster switchboard 5Fv6S B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to reroute the power with argon quantum shift booster switchboard 5Fv6S, change the wires into different slots to re-code the system.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A --> Slot 1</li><li>Wire B --> Slot B</li></ul>',
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
		id: 'hull_5fv6s_c',
		type: 'game',
		task: 'hull_5fv6s_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Argon quantum shift booster switchboard 5Fv6S C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to reroute the power with argon quantum shift booster switchboard 5Fv6S, change the wires into different slots to re-code the system.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A --> Slot 5</li></ul>',
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
		id: 'hull_5fv6s_d',
		type: 'game',
		task: 'hull_5fv6s_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Argon quantum shift booster switchboard 5Fv6S D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to reroute the power with argon quantum shift booster switchboard 5Fv6S, change the wires into different slots to re-code the system.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A --> Slot 6</li><li>Wire B --> Slot A</li></ul>',
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
		id: 'hull_5fv6s_e',
		type: 'game',
		task: 'hull_5fv6s_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Argon quantum shift booster switchboard 5Fv6S E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to reroute the power with argon quantum shift booster switchboard 5Fv6S, change the wires into different slots to re-code the system.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire B --> Slot D</li></ul>',
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
		id: 'maneuvering_369_a',
		type: 'game',
		task: 'maneuvering_369_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Coordinate calibration unit 369GKY-a A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The wires need to be changed into different slots to re-code the system.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire HY --> Slot I8</li><li>Wire 63 --> Slot Q3-2</li></ul>',
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
		id: 'maneuvering_369_b',
		type: 'game',
		task: 'maneuvering_369_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Coordinate calibration unit 369GKY-a B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The wires need to be changed into different slots to re-code the system.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire HY --> Slot I5</li><li>Wire 54 --> Slot Q4-1</li></ul>',
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
		id: 'maneuvering_369_c',
		type: 'game',
		task: 'maneuvering_369_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Coordinate calibration unit 369GKY-a C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The wires need to be changed into different slots to re-code the system.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 54 --> Slot Q3-1</li></ul>',
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
		id: 'maneuvering_369_d',
		type: 'game',
		task: 'maneuvering_369_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Coordinate calibration unit 369GKY-a D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The wires need to be changed into different slots to re-code the system.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire HY --> Slot I4</li></ul>',
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
		id: 'maneuvering_369_e',
		type: 'game',
		task: 'maneuvering_369_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Coordinate calibration unit 369GKY-a A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The wires need to be changed into different slots to re-code the system.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>HARD RESET: pull all of the wires out of their slots</li></ul>',
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
		id: 'hull_biofilter_a',
		type: 'game',
		task: 'hull_biofilter_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Dorsal ion bio-filter G5He A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Manually enter a code to re-attenuate the crystal core according to the following configuration.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 1 --> Slot B</li><li>Wire 3 --> Slot A</li></ul>',
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
		id: 'hull_biofilter_b',
		type: 'game',
		task: 'hull_biofilter_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Dorsal ion bio-filter G5He B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Manually enter a code to re-attenuate the crystal core according to the following configuration.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 2 --> Slot A</li><li>Wire 3 --> Slot B</li></ul>',
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
		id: 'hull_biofilter_c',
		type: 'game',
		task: 'hull_biofilter_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Dorsal ion bio-filter G5He C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Manually enter a code to re-attenuate the crystal core according to the following configuration.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 1 --> Slot A</li></ul>',
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
		id: 'hull_biofilter_d',
		type: 'game',
		task: 'hull_biofilter_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Dorsal ion bio-filter G5He D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Manually enter a code to re-attenuate the crystal core according to the following configuration.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 2 --> Slot A</li></ul>',
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
		id: 'hull_biofilter_e',
		type: 'game',
		task: 'hull_biofilter_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Dorsal ion bio-filter G5He E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Manually enter a code to re-attenuate the crystal core according to the following configuration.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 2 --> Slot B</li><li>Wire 3 --> Slot A</li></ul>',
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
		id: 'frontshield_antilepton_a',
		type: 'game',
		task: 'frontshield_antilepton_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Front shield antilepton control switchboard 473f A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The front shield antilepton commands need to be entered manually, in order to override the corrupted automated commands. It’s vital that all requested buttons on both switchboards are switched simultaneously.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Simultaneously switch the buttons as follows:</p><ul><li>Buttons AMP --> OFF</li><li>Buttons DRIVE --> ON</li></ul>',
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
		id: 'frontshield_antilepton_b',
		type: 'game',
		task: 'frontshield_antilepton_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Front shield antilepton control switchboard 473f B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The front shield antilepton commands need to be entered manually, in order to override the corrupted automated commands. It’s vital that all requested buttons on both switchboards are switched simultaneously.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Simultaneously switch the buttons as follows:</p><ul><li>Buttons EJCT --> ON</li></ul>',
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
		id: 'frontshield_antilepton_c',
		type: 'game',
		task: 'frontshield_antilepton_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Front shield antilepton control switchboard 473f C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The front shield antilepton commands need to be entered manually, in order to override the corrupted automated commands. It’s vital that all requested buttons on both switchboards are switched simultaneously.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Simultaneously switch the buttons as follows:</p><ul><li>Buttons THRUST --> OFF</li><li>Buttons EJCT --> OFF</li></ul>',
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
		id: 'frontshield_antilepton_d',
		type: 'game',
		task: 'frontshield_antilepton_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Front shield antilepton control switchboard 473f D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The front shield antilepton commands need to be entered manually, in order to override the corrupted automated commands. It’s vital that all requested buttons on both switchboards are switched simultaneously.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Simultaneously switch the buttons as follows:</p><ul><li>Buttons AMP --> ON</li><li>Buttons THRUST --> ON</li></ul>',
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
		id: 'frontshield_antilepton_e',
		type: 'game',
		task: 'frontshield_antilepton_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Front shield antilepton control switchboard 473f E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The front shield antilepton commands need to be entered manually, in order to override the corrupted automated commands. It’s vital that all requested buttons on both switchboards are switched simultaneously.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Simultaneously switch the buttons as follows:</p><ul><li>Buttons DRIVE --> OFF</li></ul>',
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
		id: 'missile_gammawave_a',
		type: 'game',
		task: 'missile_gammawave_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Gamma-wave missile driver control unit Rr34c A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>A new command needs to be programmed according to the following configuration.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wire as follows:</p><ul><li>Wire --> Slot +Vcc</li></ul>',
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
		id: 'missile_gammawave_b',
		type: 'game',
		task: 'missile_gammawave_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Gamma-wave missile driver control unit Rr34c B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>A new command needs to be programmed according to the following configuration.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wire as follows:</p><ul><li>Wire --> Slot W3</li></ul>',
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
		id: 'missile_gammawave_c',
		type: 'game',
		task: 'missile_gammawave_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Gamma-wave missile driver control unit Rr34c C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>A new command needs to be programmed according to the following configuration.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wire as follows:</p><ul><li>Wire --> Slot Shield</li></ul>',
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
		id: 'missile_gammawave_d',
		type: 'game',
		task: 'missile_gammawave_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Gamma-wave missile driver control unit Rr34c D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>A new command needs to be programmed according to the following configuration.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wire as follows:</p><ul><li>Wire --> Slot W1</li></ul>',
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
		id: 'missile_gammawave_e',
		type: 'game',
		task: 'missile_gammawave_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Gamma-wave missile driver control unit Rr34c E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>A new command needs to be programmed according to the following configuration.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Set up the wire as follows:</p><ul><li>Wire --> Slot P_GND</li></ul>',
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
		id: 'missile_gluon_a',
		type: 'game',
		task: 'missile_gluon_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Gluon impulse control circuit switchboard 2f345G A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code for the switchboard needs to be changed so that the nitronium flow of the missile system can be re-routed, before it critically overloads the missile system’s power supply.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Switch to cable 3 and set up the wires as follows:</p><ul><li>Wire 1 --> Slot R</li><li>Wire 2 --> Slot X</li><li>Wire 3 --> Slot Y</li><li>Wire 4 --> Slot P</li><li>Wire 5 --> Slot Z</li><li>Wire 6 --> Slot Q</li><li>Wire 7 --> Slot U</li><li>Wire 8 --> Slot W</li></ul>',
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
		id: 'missile_gluon_b',
		type: 'game',
		task: 'missile_gluon_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Gluon impulse control circuit switchboard 2f345G B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code for the switchboard needs to be changed so that the nitronium flow of the missile system can be re-routed, before it critically overloads the missile system’s power supply.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Switch to cable 5 and set up the wires as follows:</p><ul><li>Wire 1 --> Slot Q</li><li>Wire 2 --> Slot Z</li><li>Wire 3 --> Slot P</li><li>Wire 4 --> Slot W</li><li>Wire 5 --> Slot U</li><li>Wire 6 --> Slot R</li><li>Wire 7 --> Slot X</li><li>Wire 8 --> Slot Y</li></ul>',
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
		id: 'missile_gluon_c',
		type: 'game',
		task: 'missile_gluon_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Gluon impulse control circuit switchboard 2f345G C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code for the switchboard needs to be changed so that the nitronium flow of the missile system can be re-routed, before it critically overloads the missile system’s power supply.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Switch to cable 1 and set up the wires as follows:</p><ul><li>Wire 1 --> Slot Z</li><li>Wire 2 --> Slot U</li><li>Wire 3 --> Slot R</li><li>Wire 4 --> Slot W</li><li>Wire 5 --> Slot Y</li><li>Wire 6 --> Slot P</li><li>Wire 7 --> Slot Q</li><li>Wire 8 --> Slot X</li></ul>',
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
		id: 'missile_gluon_d',
		type: 'game',
		task: 'missile_gluon_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Gluon impulse control circuit switchboard 2f345G D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code for the switchboard needs to be changed so that the nitronium flow of the missile system can be re-routed, before it critically overloads the missile system’s power supply.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Switch to cable 2 and set up the wires as follows:</p><ul><li>Wire 1 --> Slot P</li><li>Wire 2 --> Slot Q</li><li>Wire 3 --> Slot R</li><li>Wire 4 --> Slot U</li><li>Wire 5 --> Slot W</li><li>Wire 6 --> Slot X</li><li>Wire 7 --> Slot Y</li><li>Wire 8 --> Slot Z</li></ul>',
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
		id: 'missile_gluon_e',
		type: 'game',
		task: 'missile_gluon_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Gluon impulse control circuit switchboard 2f345G E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The code for the switchboard needs to be changed so that the nitronium flow of the missile system can be re-routed, before it critically overloads the missile system’s power supply.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Switch to cable 4 and set up the wires as follows:</p><ul><li>Wire 1 --> Slot X</li><li>Wire 2 --> Slot Q</li><li>Wire 3 --> Slot Z</li><li>Wire 4 --> Slot Y</li><li>Wire 5 --> Slot U</li><li>Wire 6 --> Slot P</li><li>Wire 7 --> Slot W</li><li>Wire 8 --> Slot R</li></ul>',
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
		id: 'impulse_power_charge_a',
		type: 'game',
		task: 'impulse_power_charge_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse engine backup power regulation unit B33e - controlling the power charge A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Readjust the backup power charge to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Twist the button to value:</p><ul><li>300 mA</li></ul>',
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
		id: 'impulse_power_charge_b',
		type: 'game',
		task: 'impulse_power_charge_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse engine backup power regulation unit B33e - controlling the power charge B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Readjust the backup power charge to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Twist the button to value:</p><ul><li>60 V</li></ul>',
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
		id: 'impulse_power_charge_c',
		type: 'game',
		task: 'impulse_power_charge_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse engine backup power regulation unit B33e - controlling the power charge C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Readjust the backup power charge to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Twist the button to value:</p><ul><li>1500 mA</li></ul>',
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
		id: 'impulse_power_charge_d',
		type: 'game',
		task: 'impulse_power_charge_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse engine backup power regulation unit B33e - controlling the power charge D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Readjust the backup power charge to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Twist the button to value:</p><ul><li>600 V</li></ul>',
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
		id: 'impulse_power_charge_e',
		type: 'game',
		task: 'impulse_power_charge_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse engine backup power regulation unit B33e - controlling the power charge E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Readjust the backup power charge to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Twist the button to value:</p><ul><li>15 V</li></ul>',
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
		id: 'impulse_backup_supply_a',
		type: 'game',
		task: 'impulse_backup_supply_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse engine backup power regulation unit B33e - controlling power supply A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Change the power supply to another setting to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Push the button as follows:</p><ul><li>Kj</li></ul>',
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
		id: 'impulse_backup_supply_b',
		type: 'game',
		task: 'impulse_backup_supply_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse engine backup power regulation unit B33e - controlling power supply B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Change the power supply to another setting to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Push the button as follows:</p><ul><li>FM</li></ul>',
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
		id: 'impulse_backup_supply_c',
		type: 'game',
		task: 'impulse_backup_supply_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse engine backup power regulation unit B33e - controlling power supply C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Change the power supply to another setting to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Push the button as follows:</p><ul><li>rZ</li></ul>',
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
		id: 'impulse_backup_supply_d',
		type: 'game',
		task: 'impulse_backup_supply_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Impulse engine backup power regulation unit B33e - controlling power supply D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Change the power supply to another setting to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Emergency action: reset:</p><ul><li>Press two buttons to deactivate all buttons</li></ul>',
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
		id: 'beam_microfilament_ventilation',
		type: 'game',
		task: 'beam_microfilament_ventilation',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Isotopic microfilament ventilation unit Nu8-6',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The unit has become stuck in a communication loop and ceased functioning. It needs to be reset so it can be fully functional again.</p><p>The Isotopic microfilament ventilation unit Nu8-6 is located in the Hive. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
				'<p>Hard reset:</p><ul><li>Press power button for five seconds</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Wiring instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	


].forEach(blob => blobs.push(blob));

// Manual tasks
[
	// {
	// 	id: 'frontshield_55f_a',
	// 	type: 'task',
	// 	game: 'frontshield_55f_a',
	// 	singleUse: false,
	// 	used: false,
	// 	eeType: 'frontshield',
	// 	eeHealth: 0.15,
	// 	status: 'initial',
	// 	calibrationCount: 2,
	// 	calibrationTime: 240,
	// 	title: 'Re-coding Frontshield Unit Model 55f A, 55f A (F)',
	// 	description: 'Manual labor is needed. The code unit model 55f is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.1-1 for instructions. Use HANSCA repair to get new codes and calibration.',
	// 	location: 'Upper deck, Engineering Technical Space',
	// 	map: 'upper-10.png',
	// 	mapX: 325,
	// 	mapY: 400
	// },
	 {
	 	id: 'hull_5fv6s_a',
	 	type: 'task',
	 	game: 'hull_5fv6s_a',
	 	singleUse: false,
	 	used: false,
	 	eeType: 'hull',
	 	eeHealth: 0.13,
	 	status: 'initial',
	 	calibrationCount: 2,
	 	calibrationTime: 150,
	 	title: 'Argon quantum shift booster switchboard 5Fv6S A',
	 	description: 'A loss of energy of the hull systems has been observed. Power will need to be rerouted towards the hull’s argon quantum shift booster. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
	 	location: 'Upper deck, Engine room',
	 	map: 'deck2',
	 	mapX: 30, // X coordinate in image
	 	mapY: 200 // Y coordinate in image
	 },
	 {
		id: 'hull_5fv6s_b',
		type: 'task',
		game: 'hull_5fv6s_b',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 140,
		title: 'Argon quantum shift booster switchboard 5Fv6S B',
		description: 'A loss of energy of the hull systems has been observed. Power will need to be rerouted towards the hull’s argon quantum shift booster. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'hull_5fv6s_c',
		type: 'task',
		game: 'hull_5fv6s_c',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.15,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 160,
		title: 'Argon quantum shift booster switchboard 5Fv6S C',
		description: 'A loss of energy of the hull systems has been observed. Power will need to be rerouted towards the hull’s argon quantum shift booster. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'hull_5fv6s_d',
		type: 'task',
		game: 'hull_5fv6s_d',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 150,
		title: 'Argon quantum shift booster switchboard 5Fv6S D',
		description: 'A loss of energy of the hull systems has been observed. Power will need to be rerouted towards the hull’s argon quantum shift booster. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'hull_5fv6s_e',
		type: 'task',
		game: 'hull_5fv6s_e',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 160,
		title: 'Argon quantum shift booster switchboard 5Fv6S E',
		description: 'A loss of energy of the hull systems has been observed. Power will need to be rerouted towards the hull’s argon quantum shift booster. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'maneuvering_369_a',
		type: 'task',
		game: 'maneuvering_369_a',
		singleUse: false,
		used: false,
		eeType: 'maneuver',
		eeHealth: 0.19,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 280,
		title: 'Coordinate calibration unit 369GKY-a A',
		description: 'This unit translates the calculations of recalibrations of the ship’s maneuvering system into code for small corrective adjustment actions. The system needs to be re-coded as there is an internal miscommunication within the maneuvering system. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'maneuvering_369_b',
		type: 'task',
		game: 'maneuvering_369_b',
		singleUse: false,
		used: false,
		eeType: 'maneuver',
		eeHealth: 0.17,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 145,
		title: 'Coordinate calibration unit 369GKY-a B',
		description: 'This unit translates the calculations of recalibrations of the ship’s maneuvering system into code for small corrective adjustment actions. The system needs to be re-coded as there is an internal miscommunication within the maneuvering system. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'maneuvering_369_c',
		type: 'task',
		game: 'maneuvering_369_c',
		singleUse: false,
		used: false,
		eeType: 'maneuver',
		eeHealth: 0.15,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 130,
		title: 'Coordinate calibration unit 369GKY-a C',
		description: 'This unit translates the calculations of recalibrations of the ship’s maneuvering system into code for small corrective adjustment actions. The system needs to be re-coded as there is an internal miscommunication within the maneuvering system. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'maneuvering_369_d',
		type: 'task',
		game: 'maneuvering_369_d',
		singleUse: false,
		used: false,
		eeType: 'maneuver',
		eeHealth: 0.17,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 110,
		title: 'Coordinate calibration unit 369GKY-a D',
		description: 'This unit translates the calculations of recalibrations of the ship’s maneuvering system into code for small corrective adjustment actions. The system needs to be re-coded as there is an internal miscommunication within the maneuvering system. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'maneuvering_369_e',
		type: 'task',
		game: 'maneuvering_369_e',
		singleUse: false,
		used: false,
		eeType: 'maneuver',
		eeHealth: 0.19,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 300,
		title: 'Coordinate calibration unit 369GKY-a E',
		description: 'This unit translates the calculations of recalibrations of the ship’s maneuvering system into code for small corrective adjustment actions. The system needs to be re-coded as there is an internal miscommunication within the maneuvering system. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'hull_biofilter_a',
		type: 'task',
		game: 'hull_biofilter_a',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.2,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 200,
		title: 'Dorsal ion bio-filter G5He A',
		description: 'The filter is causing quantum surges that will overload the general hull system if not fixed. The filter’s crystal core needs to be re-attenuated. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, corridoor',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'hull_biofilter_b',
		type: 'task',
		game: 'hull_biofilter_b',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.19,
		status: 'initial',
		calibrationCount: 5,
		calibrationTime: 110,
		title: 'Dorsal ion bio-filter G5He B',
		description: 'The filter is causing quantum surges that will overload the general hull system if not fixed. The filter’s crystal core needs to be re-attenuated. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, corridoor',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'hull_biofilter_c',
		type: 'task',
		game: 'hull_biofilter_c',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.19,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 280,
		title: 'Dorsal ion bio-filter G5He C',
		description: 'The filter is causing quantum surges that will overload the general hull system if not fixed. The filter’s crystal core needs to be re-attenuated. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, corridoor',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'hull_biofilter_d',
		type: 'task',
		game: 'hull_biofilter_d',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.2,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 598,
		title: 'Dorsal ion bio-filter G5He D',
		description: 'The filter is causing quantum surges that will overload the general hull system if not fixed. The filter’s crystal core needs to be re-attenuated. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, corridoor',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'hull_biofilter_e',
		type: 'task',
		game: 'hull_biofilter_e',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.2,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 140,
		title: 'Dorsal ion bio-filter G5He E',
		description: 'The filter is causing quantum surges that will overload the general hull system if not fixed. The filter’s crystal core needs to be re-attenuated. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, corridoor',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'frontshield_antilepton_a',
		type: 'task',
		game: 'frontshield_antilepton_a',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.19,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 240,
		title: 'Front shield antilepton control switchboard 473f A',
		description: 'This combination of switchboards manually controls the front shield antilepton commands. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, crew bar',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'frontshield_antilepton_b',
		type: 'task',
		game: 'frontshield_antilepton_b',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.16,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 160,
		title: 'Front shield antilepton control switchboard 473f B',
		description: 'This combination of switchboards manually controls the front shield antilepton commands. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, crew bar',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'frontshield_antilepton_c',
		type: 'task',
		game: 'frontshield_antilepton_c',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 420,
		title: 'Front shield antilepton control switchboard 473f C',
		description: 'This combination of switchboards manually controls the front shield antilepton commands. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, crew bar',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'frontshield_antilepton_d',
		type: 'task',
		game: 'frontshield_antilepton_d',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.19,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 120,
		title: 'Front shield antilepton control switchboard 473f D',
		description: 'This combination of switchboards manually controls the front shield antilepton commands. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, crew bar',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'frontshield_antilepton_e',
		type: 'task',
		game: 'frontshield_antilepton_e',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 220,
		title: 'Front shield antilepton control switchboard 473f E',
		description: 'This combination of switchboards manually controls the front shield antilepton commands. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, crew bar',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'missile_gammawave_a',
		type: 'task',
		game: 'missile_gammawave_a',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.19,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 205,
		title: 'Gamma-wave missile driver control unit Rr34c A',
		description: 'This unit functions as a secondary motherboard for programming some key commands for the gamma-wave missile system. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'missile_gammawave_b',
		type: 'task',
		game: 'missile_gammawave_b',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 420,
		title: 'Gamma-wave missile driver control unit Rr34c B',
		description: 'This unit functions as a secondary motherboard for programming some key commands for the gamma-wave missile system. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'missile_gammawave_c',
		type: 'task',
		game: 'missile_gammawave_c',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 8,
		calibrationTime: 52,
		title: 'Gamma-wave missile driver control unit Rr34c C',
		description: 'This unit functions as a secondary motherboard for programming some key commands for the gamma-wave missile system. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'missile_gammawave_d',
		type: 'task',
		game: 'missile_gammawave_d',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.16,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 120,
		title: 'Gamma-wave missile driver control unit Rr34c D',
		description: 'This unit functions as a secondary motherboard for programming some key commands for the gamma-wave missile system. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'missile_gammawave_e',
		type: 'task',
		game: 'missile_gammawave_e',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.17,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 135,
		title: 'Gamma-wave missile driver control unit Rr34c E',
		description: 'This unit functions as a secondary motherboard for programming some key commands for the gamma-wave missile system. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'missile_gluon_a',
		type: 'task',
		game: 'missile_gluon_a',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.19,
		status: 'initial',
		calibrationCount: 10,
		calibrationTime: 50,
		title: 'Gluon impulse control circuit switchboard 2f345G A',
		description: 'This switchboard re-routes the nitronium flow from the gluon core to the missile propeller systems. In order to ensure the safety of the ship, the nitronium flow needs to be frequently re-routed. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'missile_gluon_b',
		type: 'task',
		game: 'missile_gluon_b',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 280,
		title: 'Gluon impulse control circuit switchboard 2f345G B',
		description: 'This switchboard re-routes the nitronium flow from the gluon core to the missile propeller systems. In order to ensure the safety of the ship, the nitronium flow needs to be frequently re-routed. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'missile_gluon_c',
		type: 'task',
		game: 'missile_gluon_c',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 190,
		title: 'Gluon impulse control circuit switchboard 2f345G C',
		description: 'This switchboard re-routes the nitronium flow from the gluon core to the missile propeller systems. In order to ensure the safety of the ship, the nitronium flow needs to be frequently re-routed. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'missile_gluon_d',
		type: 'task',
		game: 'missile_gluon_d',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.17,
		status: 'initial',
		calibrationCount: 5,
		calibrationTime: 120,
		title: 'Gluon impulse control circuit switchboard 2f345G D',
		description: 'This switchboard re-routes the nitronium flow from the gluon core to the missile propeller systems. In order to ensure the safety of the ship, the nitronium flow needs to be frequently re-routed. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'missile_gluon_e',
		type: 'task',
		game: 'missile_gluon_e',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.19,
		status: 'initial',
		calibrationCount: 8,
		calibrationTime: 70,
		title: 'Gluon impulse control circuit switchboard 2f345G E',
		description: 'This switchboard re-routes the nitronium flow from the gluon core to the missile propeller systems. In order to ensure the safety of the ship, the nitronium flow needs to be frequently re-routed. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'impulse_power_charge_a',
		type: 'task',
		game: 'impulse_power_charge_a',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 130,
		title: 'Impulse engine backup power regulation unit B33e - controlling the power charge A',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'impulse_power_charge_b',
		type: 'task',
		game: 'impulse_power_charge_b',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.10,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 90,
		title: 'Impulse engine backup power regulation unit B33e - controlling the power charge B',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'impulse_power_charge_c',
		type: 'task',
		game: 'impulse_power_charge_c',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 270,
		title: 'Impulse engine backup power regulation unit B33e - controlling the power charge C',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'impulse_power_charge_d',
		type: 'task',
		game: 'impulse_power_charge_d',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 5,
		calibrationTime: 50,
		title: 'Impulse engine backup power regulation unit B33e - controlling the power charge D',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'impulse_power_charge_e',
		type: 'task',
		game: 'impulse_power_charge_e',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 10,
		calibrationTime: 27,
		title: 'Impulse engine backup power regulation unit B33e - controlling the power charge E',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'impulse_backup_supply_a',
		type: 'task',
		game: 'impulse_backup_supply_a',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 150,
		title: 'Impulse engine backup power regulation unit B33e - controlling power supply A',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'impulse_backup_supply_b',
		type: 'task',
		game: 'impulse_backup_supply_b',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.10,
		status: 'initial',
		calibrationCount: 8,
		calibrationTime: 35,
		title: 'Impulse engine backup power regulation unit B33e - controlling power supply B',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'impulse_backup_supply_c',
		type: 'task',
		game: 'impulse_backup_supply_c',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 5,
		calibrationTime: 60,
		title: 'Impulse engine backup power regulation unit B33e - controlling power supply C',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'impulse_backup_supply_d',
		type: 'task',
		game: 'impulse_backup_supply_d',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 280,
		title: 'Impulse engine backup power regulation unit B33e - controlling power supply D',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},
	{
		id: 'beam_microfilament_ventilation',
		type: 'task',
		game: 'beam_microfilament_ventilation',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.06,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 60,
		title: 'Isotopic microfilament ventilation unit Nu8-6',
		description: 'This ventilation unit supports the regulation of the ventilation of the beam weapons system whenever the realignment of the delta-wave drive pedals bears a risk of overheating. Manual labor is needed. Perform the manual task according to instructions.</p><p>The Isotopic microfilament ventilation unit Nu8-6 is located in the Hive. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, hive',
		map: 'deck2',
		mapX: 30, // X coordinate in image
		mapY: 200 // Y coordinate in image
	},




].forEach(blob => blobs.push(blob));

export default blobs;
