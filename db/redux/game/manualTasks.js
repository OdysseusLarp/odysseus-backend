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
			title: 'Fault in Argon quantum shift booster switchboard 5Fv6S A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to reroute the power with argon quantum shift booster switchboard 5Fv6S, change the wires into different slots to re-code the system.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for instructions.</p>',
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
			title: 'Fault in Argon quantum shift booster switchboard 5Fv6S B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to reroute the power with argon quantum shift booster switchboard 5Fv6S, change the wires into different slots to re-code the system.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for instructions.</p>',
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
			title: 'Fault in Argon quantum shift booster switchboard 5Fv6S C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to reroute the power with argon quantum shift booster switchboard 5Fv6S, change the wires into different slots to re-code the system.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for instructions.</p>',
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
			title: 'Fault in Argon quantum shift booster switchboard 5Fv6S D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to reroute the power with argon quantum shift booster switchboard 5Fv6S, change the wires into different slots to re-code the system.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for instructions.</p>',
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
			title: 'Fault in Argon quantum shift booster switchboard 5Fv6S E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to reroute the power with argon quantum shift booster switchboard 5Fv6S, change the wires into different slots to re-code the system.</p><p>The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The wires need to be changed into different slots to re-code the system.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.19-93 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The wires need to be changed into different slots to re-code the system.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.19-93 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The wires need to be changed into different slots to re-code the system.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.19-93 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The wires need to be changed into different slots to re-code the system.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.19-93 for instructions.</p>',
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
			title: 'Coordinate calibration unit 369GKY-a E',
			title: 'Coordinate calibration unit 369GKY-a E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The wires need to be changed into different slots to re-code the system.</p><p>The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.19-93 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Manually enter a code to re-attenuate the crystal core according to the following configuration.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.12-63 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Manually enter a code to re-attenuate the crystal core according to the following configuration.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.12-63 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Manually enter a code to re-attenuate the crystal core according to the following configuration.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.12-63 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Manually enter a code to re-attenuate the crystal core according to the following configuration.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.12-63 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Manually enter a code to re-attenuate the crystal core according to the following configuration.</p><p>The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.12-63 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The front shield antilepton commands need to be entered manually, in order to override the corrupted automated commands. It’s vital that all requested buttons on both switchboards are switched simultaneously.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.13-30 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The front shield antilepton commands need to be entered manually, in order to override the corrupted automated commands. It’s vital that all requested buttons on both switchboards are switched simultaneously.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.13-30 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The front shield antilepton commands need to be entered manually, in order to override the corrupted automated commands. It’s vital that all requested buttons on both switchboards are switched simultaneously.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.13-30 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The front shield antilepton commands need to be entered manually, in order to override the corrupted automated commands. It’s vital that all requested buttons on both switchboards are switched simultaneously.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.13-30 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The front shield antilepton commands need to be entered manually, in order to override the corrupted automated commands. It’s vital that all requested buttons on both switchboards are switched simultaneously.</p><p>The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.13-30 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>A new command needs to be programmed according to the following configuration.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.3-65 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>A new command needs to be programmed according to the following configuration.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.3-65 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>A new command needs to be programmed according to the following configuration.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.3-65 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>A new command needs to be programmed according to the following configuration.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.3-65 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>A new command needs to be programmed according to the following configuration.</p><p>The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.3-65 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The code for the switchboard needs to be changed so that the nitronium flow of the missile system can be re-routed, before it critically overloads the missile system’s power supply.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.5-31 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The code for the switchboard needs to be changed so that the nitronium flow of the missile system can be re-routed, before it critically overloads the missile system’s power supply.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.5-31 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The code for the switchboard needs to be changed so that the nitronium flow of the missile system can be re-routed, before it critically overloads the missile system’s power supply.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.5-31 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The code for the switchboard needs to be changed so that the nitronium flow of the missile system can be re-routed, before it critically overloads the missile system’s power supply.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.5-31 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The code for the switchboard needs to be changed so that the nitronium flow of the missile system can be re-routed, before it critically overloads the missile system’s power supply.</p><p>The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.5-31 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Readjust the backup power charge to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-3 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Readjust the backup power charge to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-3 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Readjust the backup power charge to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-3 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Readjust the backup power charge to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-3 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Readjust the backup power charge to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-3 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Change the power supply to another setting to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-2 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Change the power supply to another setting to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-2 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Change the power supply to another setting to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-2 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>Change the power supply to another setting to fix the anomaly.</p><p>The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-2 for instructions.</p>',
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
				'<p>Perform the manual task according to instructions.</p><p>The unit has become stuck in a communication loop and ceased functioning. It needs to be reset so it can be fully functional again.</p><p>The Isotopic microfilament ventilation unit Nu8-6 is located in the Hive. Refer to ESS Odysseus Operations Handbook page 2.4-45 for instructions.</p>',
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
	{
		id: 'frontshield_x41_a',
		type: 'game',
		task: 'frontshield_x41_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Microfilament generator (model X41) anomalities A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The front shield’s gluon fetcher is showing anomalous power signatures and the power supply needs to be changed. Change the code for the generator in order to do so.</p><p>The Microfilament generator (model X41) is located in the engine room. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A --> Slot NC</li><li>Wire 2 --> Slot +V</li><li>Wire 3 --> Slot GR</li></ul>',
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
		id: 'frontshield_x41_b',
		type: 'game',
		task: 'frontshield_x41_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Microfilament generator (model X41) anomalities B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The front shield’s gluon fetcher is showing anomalous power signatures and the power supply needs to be changed. Change the code for the generator in order to do so.</p><p>The Microfilament generator (model X41) is located in the engine room. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire B --> Slot +V</li><li>Wire 1 --> Slot -V</li></ul>',
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
		id: 'frontshield_x41_c',
		type: 'game',
		task: 'frontshield_x41_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Microfilament generator (model X41) anomalities C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The front shield’s gluon fetcher is showing anomalous power signatures and the power supply needs to be changed. Change the code for the generator in order to do so.</p><p>The Microfilament generator (model X41) is located in the engine room. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A --> Slot -V</li><li>Wire B --> Slot NC</li><li>Wire 3 --> Slot +V</li></ul>',
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
		id: 'frontshield_x41_d',
		type: 'game',
		task: 'frontshield_x41_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Microfilament generator (model X41) anomalities D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The front shield’s gluon fetcher is showing anomalous power signatures and the power supply needs to be changed. Change the code for the generator in order to do so.</p><p>The Microfilament generator (model X41) is located in the engine room. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire B --> Slot -V</li><li>Wire 1 --> Slot +V</li><li>Wire 2 --> Slot GR</li></ul>',
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
		id: 'frontshield_x41_e',
		type: 'game',
		task: 'frontshield_x41_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Microfilament generator (model X41) anomalities E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The front shield’s gluon fetcher is showing anomalous power signatures and the power supply needs to be changed. Change the code for the generator in order to do so.</p><p>The Microfilament generator (model X41) is located in the engine room. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A --> Slot -V</li><li>Wire 2 --> Slot -V</li></ul>',
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
		id: 'maneuvering_decetor',
		type: 'game',
		task: 'maneuvering_decetor',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Unidedified articles on Isotopic particle detector K1p (model SICK)',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The isotopic gamma-spore reader is dirty and needs to be cleaned.</p><p>Isotopic particle detector K1p (model SICK) is located in the war room. Refer to ESS Odysseus Operations Handbook page 2.4-21 for instructions.</p>',
				'<p>Clean isotopic gamma-spore reader</p',
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
		id: 'rearshield_x41_a',
		type: 'game',
		task: 'rearshield_x41_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Microfilament generator (model X41) A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The rear shield’s gluon fetcher is showing anomalous power signatures and the power supply needs to be changed. Change the code for the generator in order to do so.</p><p>The Microfilament generator (model X41) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire B --> Slot NC</li><li>Wire 1 --> Slot -V</li><li>Wire 2 --> Slot GR</li></ul>',
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
		id: 'rearshield_x41_b',
		type: 'game',
		task: 'rearshield_x41_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Microfilament generator (model X41) B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The rear shield’s gluon fetcher is showing anomalous power signatures and the power supply needs to be changed. Change the code for the generator in order to do so.</p><p>The Microfilament generator (model X41) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A --> Slot -V</li><li>Wire 3 --> Slot -V</li></ul>',
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
		id: 'rearshield_x41_c',
		type: 'game',
		task: 'rearshield_x41_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Microfilament generator (model X41) C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The rear shield’s gluon fetcher is showing anomalous power signatures and the power supply needs to be changed. Change the code for the generator in order to do so.</p><p>The Microfilament generator (model X41) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A --> Slot NC</li><li>Wire B --> Slot +V</li><li>Wire 1 --> Slot GR</li></ul>',
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
		id: 'rearshield_x41_d',
		type: 'game',
		task: 'rearshield_x41_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Microfilament generator (model X41) D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The rear shield’s gluon fetcher is showing anomalous power signatures and the power supply needs to be changed. Change the code for the generator in order to do so.</p><p>The Microfilament generator (model X41) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A --> Slot -V</li><li>Wire 1 --> Slot GR</li><li>Wire 3 --> Slot +V</li></ul>',
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
		id: 'rearshield_x41_e',
		type: 'game',
		task: 'rearshield_x41_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Microfilament generator (model X41) E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The rear shield’s gluon fetcher is showing anomalous power signatures and the power supply needs to be changed. Change the code for the generator in order to do so.</p><p>The Microfilament generator (model X41) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire B --> Slot +V</li><li>Wire 3 --> Slot -V</li></ul>',
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
		id: 'beam_neogenic_a',
		type: 'game',
		task: 'beam_neogenic_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - controlling the power of the gamma-wave shifter A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Due to some unclear anomalies, the power of the gamma-wave shifter needs to be changed according to current circumstances.</p><p>The Neogenic capacitator GR3914D - power of the gamma-wave shifter is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Push button to deactivate.</p>',
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
		id: 'beam_neogenic_b',
		type: 'game',
		task: 'beam_neogenic_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - controlling the power of the gamma-wave shifter B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Due to some unclear anomalies, the power of the gamma-wave shifter needs to be changed according to current circumstances.</p><p>The Neogenic capacitator GR3914D - power of the gamma-wave shifter is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Twist button to activate.</p>',
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
		id: 'missile_neogenic_a',
		type: 'game',
		task: 'missile_neogenic_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - reprogramming the delta-wave fuse box A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Reprogram the delta-wave fuse box.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Switch fuses as follows:</p><ul><li>Latch 2</li><li>Latch 5</li><li>Latch 10</li></ul>',
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
		id: 'missile_neogenic_b',
		type: 'game',
		task: 'missile_neogenic_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - reprogramming the delta-wave fuse box B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Reprogram the delta-wave fuse box.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Switch fuses as follows:</p><ul><li>Latch 1</li><li>Latch 3</li><li>Latch 7</li></ul>',
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
		id: 'missile_neogenic_c',
		type: 'game',
		task: 'missile_neogenic_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - reprogramming the delta-wave fuse box C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Reprogram the delta-wave fuse box.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Switch fuses as follows:</p><ul><li>Latch 6</li><li>Latch 9</li><li>Latch 10</li></ul>',
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
		id: 'missile_neogenic_d',
		type: 'game',
		task: 'missile_neogenic_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - reprogramming the delta-wave fuse box D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Reprogram the delta-wave fuse box.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Switch fuses as follows:</p><ul><li>Latch 1</li><li>Latch 4</li><li>Latch 5</li></ul>',
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
		id: 'missile_neogenic_e',
		type: 'game',
		task: 'missile_neogenic_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - reprogramming the delta-wave fuse box E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Reprogram the delta-wave fuse box.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Switch fuses as follows:</p><ul><li>Latch 2</li><li>Latch 7</li><li>Latch 8</li></ul>',
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
		id: 'hull_neogenic_a',
		type: 'game',
		task: 'hull_neogenic_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - rerouting the dilithium containment core control signals A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Reroute the control signals for the dilithium containment core, as the hull power grid is at risk of being overcharged.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire F-5 --> Slot 37</li><li>Wire Q-4 --> Slot 68</li></ul>',
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
		id: 'hull_neogenic_b',
		type: 'game',
		task: 'hull_neogenic_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - rerouting the dilithium containment core control signals B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Reroute the control signals for the dilithium containment core, as the hull power grid is at risk of being overcharged.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire A-7 --> Slot A</li><li>Wire X-2 --> Slot 1</li><li>Wire Y-11 --> Slot C</li></ul>',
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
		id: 'hull_neogenic_c',
		type: 'game',
		task: 'hull_neogenic_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - rerouting the dilithium containment core control signals C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Reroute the control signals for the dilithium containment core, as the hull power grid is at risk of being overcharged.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><liWire F-5 --> Slot B</li><li>Wire X-2 --> Slot 26</li><li>Wire Y-11 --> Slot 33</li><li>Wire Q-4 --> Slot 19</li></ul>',
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
		id: 'hull_neogenic_d',
		type: 'game',
		task: 'hull_neogenic_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - rerouting the dilithium containment core control signals D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Reroute the control signals for the dilithium containment core, as the hull power grid is at risk of being overcharged.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire F-5 --> Slot C</li><li>Wire X-2 --> Slot 71</li><li>Wire Y-11 --> Slot 59</li><li>Wire Q-4 --> Slot A</li><li>Wire A-7 --> Slot 24</li></ul>',
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
		id: 'hull_neogenic_e',
		type: 'game',
		task: 'hull_neogenic_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - rerouting the dilithium containment core control signals E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Reroute the control signals for the dilithium containment core, as the hull power grid is at risk of being overcharged.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire X-2 --> Slot 29</li><li>Wire F-5 --> Slot 12</li><li>Wire Q-4 --> Slot 61</li><li>Wire Y-11 --> Slot C</li><li>Wire A-7 --> Slot B</li></ul>',
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
		id: 'rearshield_neogenic',
		type: 'game',
		task: 'rearshield_neogenic',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Neogenic capacitator GR3914D - resetting the positronic stabilizer',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>In order to resynchronise the rear shield’s positronic stabilizer, it needs to be reset.</p><p>The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions.</p>',
				'<p>Push reset button twice</p>',
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
		id: 'maneuvering_y99z_a',
		type: 'game',
		task: 'maneuvering_y99z_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Promethium warp fragmentor Y99z A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system.</p><p>Promethium warp fragmentor Y99z is located in the med bay. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions.</p>',
				'<p>Flick switches as follows:</p><ul><li>Switches 1, 2, 6, 8, 10 --> ON</li><li>Switches 3, 4, 5, 7, 9 --> OFF</li></ul>',
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
		id: 'maneuvering_y99z_b',
		type: 'game',
		task: 'maneuvering_y99z_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Promethium warp fragmentor Y99z B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system.</p><p>Promethium warp fragmentor Y99z is located in the med bay. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions.</p>',
				'<p>Flick switches as follows:</p><ul><li>Switches 2, 4, 5, 9 --> ON</li><li>Switches 1, 3, 6, 7, 8, 10 --> OFF</li></ul>',
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
		id: 'maneuvering_y99z_c',
		type: 'game',
		task: 'maneuvering_y99z_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Promethium warp fragmentor Y99z C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system.</p><p>Promethium warp fragmentor Y99z is located in the med bay. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions.</p>',
				'<p>Flick switches as follows:</p><ul><li>Switches 1, 3, 4, 6, 7, 9 --> ON</li><li>Switches 2, 5, 8, 10 --> OFF</li></ul>',
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
		id: 'maneuvering_y99z_d',
		type: 'game',
		task: 'maneuvering_y99z_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Promethium warp fragmentor Y99z D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system.</p><p>Promethium warp fragmentor Y99z is located in the med bay. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions.</p>',
				'<p>Flick switches as follows:</p><ul><li>Switches 3, 5, 6, 8, 9 --> ON</li><li>Switches 1, 2, 4, 7, 10 --> OFF</li></ul>',
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
		id: 'maneuvering_y99z_e',
		type: 'game',
		task: 'maneuvering_y99z_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Promethium warp fragmentor Y99z E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system.</p><p>Promethium warp fragmentor Y99z is located in the med bay. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions.</p>',
				'<p>Flick switches as follows:</p><ul><li>Switches 1, 4, 6, 7, 8 --> ON</li><li>Switches 2, 3, 5, 9, 10 --> OFF</li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Wiring instructions',
				'Next',
				'Calibrate'
			]
		}
	},



	//Captains quarters
	{
		id: 'maneuvering_y99y_a',
		type: 'game',
		task: 'maneuvering_y99y_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Promethium warp fragmentor Y99y A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system.</p><p>Promethium warp fragmentor Y99y is located in the captains quarters. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions.</p>',
				'<p>Flick switches as follows:</p><ul><li>Switches 1, 2, 6, 8, 10 --> ON</li><li>Switches 3, 4, 5, 7, 9 --> OFF</li></ul>',
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
		id: 'maneuvering_y99y_b',
		type: 'game',
		task: 'maneuvering_y99y_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Promethium warp fragmentor Y99y B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system.</p><p>Promethium warp fragmentor Y99y is located in the captains quarters. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions.</p>',
				'<p>Flick switches as follows:</p><ul><li>Switches 2, 4, 5, 9 --> ON</li><li>Switches 1, 3, 6, 7, 8, 10 --> OFF</li></ul>',
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
		id: 'maneuvering_y99y_c',
		type: 'game',
		task: 'maneuvering_y99y_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Promethium warp fragmentor Y99y C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system.</p><p>Promethium warp fragmentor Y99y is located in the captains quarters. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions.</p>',
				'<p>Flick switches as follows:</p><ul><li>Switches 1, 3, 4, 6, 7, 9 --> ON</li><li>Switches 2, 5, 8, 10 --> OFF</li></ul>',
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
		id: 'maneuvering_y99y_d',
		type: 'game',
		task: 'maneuvering_y99y_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Promethium warp fragmentor Y99y D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system.</p><p>Promethium warp fragmentor Y99y is located in the captains quarters. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions.</p>',
				'<p>Flick switches as follows:</p><ul><li>Switches 3, 5, 6, 8, 9 --> ON</li><li>Switches 1, 2, 4, 7, 10 --> OFF</li></ul>',
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
		id: 'maneuvering_y99y_e',
		type: 'game',
		task: 'maneuvering_y99y_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Promethium warp fragmentor Y99y E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system.</p><p>Promethium warp fragmentor Y99y is located in the captains quarters. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions.</p>',
				'<p>Flick switches as follows:</p><ul><li>Switches 1, 4, 6, 7, 8 --> ON</li><li>Switches 2, 3, 5, 9, 10 --> OFF</li></ul>',
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
		id: 'reactor_464_a',
		type: 'game',
		task: 'reactor_464_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Radiation containment switch 464-900 A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p> A buildup of alpha and beta particles has been observed, and the switch needs to be flicked to reroute energy to alternative charge splitters.</p><p>The Radiation containment switch 464-900 is located above the mess hall. Refer to ESS Odysseus Operations Handbook page 3-186 for instructions.</p>',
				'<p>Flick switch as follows:</p><ul><li>Up/li></ul>',
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
		id: 'reactor_464_b',
		type: 'game',
		task: 'reactor_464_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Radiation containment switch 464-900 B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p> A buildup of alpha and beta particles has been observed, and the switch needs to be flicked to reroute energy to alternative charge splitters.</p><p>The Radiation containment switch 464-900 is located above the mess hall. Refer to ESS Odysseus Operations Handbook page 3-186 for instructions.</p>',
				'<p>Flick switch as follows:</p><ul><li>Down/li></ul>',
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
		id: 'reactor_464_c',
		type: 'game',
		task: 'reactor_464_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Radiation containment switch 464-900 C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p> A buildup of alpha and beta particles has been observed, and the switch needs to be flicked to reroute energy to alternative charge splitters.</p><p>The Radiation containment switch 464-900 is located above the mess hall. Refer to ESS Odysseus Operations Handbook page 3-186 for instructions.</p>',
				'<p>Flick switch as follows:</p><ul><li>Middle/li></ul>',
				'<p>Move to calibrating when complete.</p>'
			],
			buttons: [
				'Wiring instructions',
				'Next',
				'Calibrate'
			]
		}
	},
	// {
	// 	id: 'rearshield_lubricator_a',
	// 	type: 'game',
	// 	task: 'rearshield_lubricator_a',
	// 	game_config: 'manual',
	// 	status: 'fixed',
	// 	config: {
	// 		title: 'Revolving pulse turbine lubricator switch 53r A',
	// 		pages: [
	// 			'<p>Perform the manual task according to instructions.</p><p>The rear shield has suffered damage, and the revolving pulse signals need to be re-attenuated to ensure the shield remains up.</p><p>The Revolving pulse turbine lubricator switch 53r is located in the war room. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
	// 			'<p>Turn the switches as follows:</p><ul><li>Switch AA --> SUP.</li><li>Switch AB --> SUP.</li></ul>',
	// 			'<p>Move to calibrating when complete.</p>'
	// 		],
	// 		buttons: [
	// 			'Wiring instructions',
	// 			'Next',
	// 			'Calibrate'
	// 		]
	// 	}
	// },
	// {
	// 	id: 'rearshield_lubricator_b',
	// 	type: 'game',
	// 	task: 'rearshield_lubricator_b',
	// 	game_config: 'manual',
	// 	status: 'fixed',
	// 	config: {
	// 		title: 'Revolving pulse turbine lubricator switch 53r B',
	// 		pages: [
	// 			'<p>Perform the manual task according to instructions.</p><p>The rear shield has suffered damage, and the revolving pulse signals need to be re-attenuated to ensure the shield remains up.</p><p>The Revolving pulse turbine lubricator switch 53r is located in the war room. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
	// 			'<p>Turn the switches as follows:</p><ul><li>Switch AA --> EXH.</li><li>Switch AB --> SUP.</li></ul>',
	// 			'<p>Move to calibrating when complete.</p>'
	// 		],
	// 		buttons: [
	// 			'Wiring instructions',
	// 			'Next',
	// 			'Calibrate'
	// 		]
	// 	}
	// },
	// {
	// 	id: 'rearshield_lubricator_c',
	// 	type: 'game',
	// 	task: 'rearshield_lubricator_c',
	// 	game_config: 'manual',
	// 	status: 'fixed',
	// 	config: {
	// 		title: 'Revolving pulse turbine lubricator switch 53r C',
	// 		pages: [
	// 			'<p>Perform the manual task according to instructions.</p><p>The rear shield has suffered damage, and the revolving pulse signals need to be re-attenuated to ensure the shield remains up.</p><p>The Revolving pulse turbine lubricator switch 53r is located in the war room. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
	// 			'<p>Turn the switches as follows:</p><ul><li>Switch AA --> SUP.</li><li>Switch AB --> EXH.</li></ul>',
	// 			'<p>Move to calibrating when complete.</p>'
	// 		],
	// 		buttons: [
	// 			'Wiring instructions',
	// 			'Next',
	// 			'Calibrate'
	// 		]
	// 	}
	// },
	// {
	// 	id: 'rearshield_lubricator_d',
	// 	type: 'game',
	// 	task: 'rearshield_lubricator_d',
	// 	game_config: 'manual',
	// 	status: 'fixed',
	// 	config: {
	// 		title: 'Revolving pulse turbine lubricator switch 53r D',
	// 		pages: [
	// 			'<p>Perform the manual task according to instructions.</p><p>The rear shield has suffered damage, and the revolving pulse signals need to be re-attenuated to ensure the shield remains up.</p><p>The Revolving pulse turbine lubricator switch 53r is located in the war room. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions.</p>',
	// 			'<p>Turn the switches as follows:</p><ul><li>Switch AA --> EXH.</li><li>Switch AB --> EXH.</li></ul>',
	// 			'<p>Move to calibrating when complete.</p>'
	// 		],
	// 		buttons: [
	// 			'Wiring instructions',
	// 			'Next',
	// 			'Calibrate'
	// 		]
	// 	}
	// },
	{
		id: 'doomba',
		type: 'game',
		task: 'doomba',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Roomba (old model, brand: Samsung)',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>A very rare malfunction occurred. The Hyperclean function has been activated for too long and the Roomba’s programming has started to interpret hypercleaning as making sure all sources of filth, in this context, humans, are exterminated. The hyperclean function should be deactivated.</p><p>The Roomba (old model, brand: Samsung) is located in the green room. Refer to ESS Odysseus Operations Handbook page 3-219 for instructions.</p>',
				'<p>Deactivate the Hyperclean function:</p><ul><li>Disassemble the roomba</li><li>Push the Hyperclean button to deactivate</li></ul>',
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
		id: 'beam_voltmeter_a',
		type: 'game',
		task: 'beam_voltmeter_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Versatile Voltmeter B7-17 (model 562) A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The argon quantum shift propulsion of the beam weapons is no longer synchronized, so the setting has been recalculated and needs to be changed.</p><p>The Versatile Voltmeter B7-17 (model 562) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-49 for instructions.</p>',
				'<p>Change the setting as follows:</p><ul><li>Turn switch to 0 / 1</li></ul>',
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
		id: 'beam_voltmeter_b',
		type: 'game',
		task: 'beam_voltmeter_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Versatile Voltmeter B7-17 (model 562) B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The argon quantum shift propulsion of the beam weapons is no longer synchronized, so the setting has been recalculated and needs to be changed.</p><p>The Versatile Voltmeter B7-17 (model 562) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-49 for instructions.</p>',
				'<p>Change the setting as follows:</p><ul><li>Turn switch to +50 / 300 / x105</li></ul>',
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
		id: 'beam_voltmeter_c',
		type: 'game',
		task: 'beam_voltmeter_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Versatile Voltmeter B7-17 (model 562) C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The argon quantum shift propulsion of the beam weapons is no longer synchronized, so the setting has been recalculated and needs to be changed.</p><p>The Versatile Voltmeter B7-17 (model 562) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-49 for instructions.</p>',
				'<p>Change the setting as follows:</p><ul><li>Turn switch to +20 / 10</li></ul>',
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
		id: 'beam_voltmeter_d',
		type: 'game',
		task: 'beam_voltmeter_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Versatile Voltmeter B7-17 (model 562) D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The argon quantum shift propulsion of the beam weapons is no longer synchronized, so the setting has been recalculated and needs to be changed.</p><p>The Versatile Voltmeter B7-17 (model 562) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-49 for instructions.</p>',
				'<p>Change the setting as follows:</p><ul><li>Turn switch to +10 / 3 / x107</li></ul>',
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
		id: 'beam_voltmeter_e',
		type: 'game',
		task: 'beam_voltmeter_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Versatile Voltmeter B7-17 (model 562) E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>The argon quantum shift propulsion of the beam weapons is no longer synchronized, so the setting has been recalculated and needs to be changed.</p><p>The Versatile Voltmeter B7-17 (model 562) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-49 for instructions.</p>',
				'<p>Change the setting as follows:</p><ul><li>Turn switch to -10 / 0,3U</li></ul>',
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
		id: 'impulse_reroute_a',
		type: 'game',
		task: 'impulse_reroute_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Zirconium gluon gel core control panel - Re-routing control signals A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Readings show anomalies in the zirconium values, so it needs to be contained. Re-code the system, so that the control signals can be re-routed.</p><p>Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-32 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 09 --> Slot 16</li><li>Wire 72 --> Slot 23</li></ul>',
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
		id: 'impulse_reroute_b',
		type: 'game',
		task: 'impulse_reroute_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Zirconium gluon gel core control panel - Re-routing control signals B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Readings show anomalies in the zirconium values, so it needs to be contained. Re-code the system, so that the control signals can be re-routed.</p><p>Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-32 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 25 --> Slot 4</li><li>Wire 72 --> Slot 19</li><li>Wire 86 --> Slot 11</li></ul>',
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
		id: 'impulse_reroute_c',
		type: 'game',
		task: 'impulse_reroute_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Zirconium gluon gel core control panel - Re-routing control signals C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Readings show anomalies in the zirconium values, so it needs to be contained. Re-code the system, so that the control signals can be re-routed.</p><p>Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-32 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 09 --> Slot 22</li><li>Wire 25 --> Slot 14</li><li>Wire 86 --> Slot 1</li></ul>',
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
		id: 'impulse_reroute_d',
		type: 'game',
		task: 'impulse_reroute_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Zirconium gluon gel core control panel - Re-routing control signals D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Readings show anomalies in the zirconium values, so it needs to be contained. Re-code the system, so that the control signals can be re-routed.</p><p>Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-32 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 86 --> Slot 7</li></ul>',
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
		id: 'impulse_reroute_e',
		type: 'game',
		task: 'impulse_reroute_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Zirconium gluon gel core control panel - Re-routing control signals E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Readings show anomalies in the zirconium values, so it needs to be contained. Re-code the system, so that the control signals can be re-routed.</p><p>Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-32 for instructions.</p>',
				'<p>Set up the wires as follows:</p><ul><li>Wire 09 --> Slot 17</li><li>Wire 25 --> Slot 3</li><li>Wire 72 --> Slot 24</li><li>Wire 86 --> Slot 9</li></ul>',
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
		id: 'impulse_reset_a',
		type: 'game',
		task: 'impulse_reset_a',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Zirconium gluon gel core control panel - System reset and reprogramming A',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Plasma surges have been observed in the core. The system needs to be reset and reprogrammed to avoid a potentially critical plasma surge.</p><p>Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-35 for instructions.</p>',
				'<p>Press the buttons and reset as follows:</p><ul><li>Buttons Y Y</li><li>Button START</li><li>Button ACK</li></ul>',
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
		id: 'impulse_reset_b',
		type: 'game',
		task: 'impulse_reset_b',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Zirconium gluon gel core control panel - System reset and reprogramming B',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Plasma surges have been observed in the core. The system needs to be reset and reprogrammed to avoid a potentially critical plasma surge.</p><p>Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-35 for instructions.</p>',
				'<p>Press the buttons and reset as follows:</p><ul><li>Buttons X X</li><li>Buttons Z Z</li></ul>',
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
		id: 'impulse_reset_c',
		type: 'game',
		task: 'impulse_reset_c',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Zirconium gluon gel core control panel - System reset and reprogramming C',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Plasma surges have been observed in the core. The system needs to be reset and reprogrammed to avoid a potentially critical plasma surge.</p><p>Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-35 for instructions.</p>',
				'<p>Press the buttons and reset as follows:</p><ul><li>Buttons W W</li><li>Button ACK</li><li>Button START</li><li>Button STOP</li></ul>',
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
		id: 'impulse_reset_d',
		type: 'game',
		task: 'impulse_reset_d',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Zirconium gluon gel core control panel - System reset and reprogramming D',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Plasma surges have been observed in the core. The system needs to be reset and reprogrammed to avoid a potentially critical plasma surge.</p><p>Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-35 for instructions.</p>',
				'<p>Press the buttons and reset as follows:</p><ul><li>Buttons Y Y</li><li>Buttons Z Z</li><li>Button STOP</li></ul>',
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
		id: 'impulse_reset_e',
		type: 'game',
		task: 'impulse_reset_e',
		game_config: 'manual',
		status: 'fixed',
		config: {
			title: 'Zirconium gluon gel core control panel - System reset and reprogramming E',
			pages: [
				'<p>Perform the manual task according to instructions.</p><p>Plasma surges have been observed in the core. The system needs to be reset and reprogrammed to avoid a potentially critical plasma surge.</p><p>Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-35 for instructions.</p>',
				'<p>Press the buttons and reset as follows:</p><ul><li>Buttons X X</li><li>Buttons Z Z</li><li>Buttons W W</li><li>Button ACK</li></ul>',
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
	 	title: 'Fault in Argon quantum shift booster switchboard 5Fv6S A',
	 	description: 'A loss of energy of the hull systems has been observed. Power will need to be rerouted towards the hull’s argon quantum shift booster. Manual labor is needed. Perform the manual task according to instructions.The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for instructions. Use HANSCA repair for calibration.',
	 	location: 'Upper deck, Engine room',
	 	map: 'deck2',
	 	mapX: 780, // X coordinate in image
	 	mapY: 1700 // Y coordinate in image
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
		title: 'Fault in Argon quantum shift booster switchboard 5Fv6S B',
		description: 'A loss of energy of the hull systems has been observed. Power will need to be rerouted towards the hull’s argon quantum shift booster. Manual labor is needed. Perform the manual task according to instructions. The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 780, // X coordinate in image
	 	mapY: 1700 // Y coordinate in image
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
		title: 'Fault in Argon quantum shift booster switchboard 5Fv6S C',
		description: 'A loss of energy of the hull systems has been observed. Power will need to be rerouted towards the hull’s argon quantum shift booster. Manual labor is needed. Perform the manual task according to instructions.The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 780, // X coordinate in image
	 	mapY: 1700 // Y coordinate in image
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
		title: 'Fault in Argon quantum shift booster switchboard 5Fv6S D',
		description: 'A loss of energy of the hull systems has been observed. Power will need to be rerouted towards the hull’s argon quantum shift booster. Manual labor is needed. Perform the manual task according to instructions.The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 780, // X coordinate in image
	 	mapY: 1700 // Y coordinate in image
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
		title: 'Fault in Argon quantum shift booster switchboard 5Fv6S E',
		description: 'A loss of energy of the hull systems has been observed. Power will need to be rerouted towards the hull’s argon quantum shift booster. Manual labor is needed. Perform the manual task according to instructions.The Argon quantum shift booster switchboard 5Fv6S is located in Engineering Technical Space. Refer to ESS Odysseus Operations Handbook page 2.5-19 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 780, // X coordinate in image
	 	mapY: 1700 // Y coordinate in image
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
		description: 'This unit translates the calculations of recalibrations of the ship’s maneuvering system into code for small corrective adjustment actions. The system needs to be re-coded as there is an internal miscommunication within the maneuvering system. Manual labor is needed. Perform the manual task according to instructions.The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.19-93 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 520, // X coordinate in image
		mapY: 1650 // Y coordinate in image
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
		description: 'This unit translates the calculations of recalibrations of the ship’s maneuvering system into code for small corrective adjustment actions. The system needs to be re-coded as there is an internal miscommunication within the maneuvering system. Manual labor is needed. Perform the manual task according to instructions.The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.19-93 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 520, // X coordinate in image
		mapY: 1650 // Y coordinate in image
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
		description: 'This unit translates the calculations of recalibrations of the ship’s maneuvering system into code for small corrective adjustment actions. The system needs to be re-coded as there is an internal miscommunication within the maneuvering system. Manual labor is needed. Perform the manual task according to instructions.The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.19-93 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 520, // X coordinate in image
		mapY: 1650 // Y coordinate in image
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
		description: 'This unit translates the calculations of recalibrations of the ship’s maneuvering system into code for small corrective adjustment actions. The system needs to be re-coded as there is an internal miscommunication within the maneuvering system. Manual labor is needed. Perform the manual task according to instructions.The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.19-93 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 520, // X coordinate in image
		mapY: 1650 // Y coordinate in image
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
		description: 'This unit translates the calculations of recalibrations of the ship’s maneuvering system into code for small corrective adjustment actions. The system needs to be re-coded as there is an internal miscommunication within the maneuvering system. Manual labor is needed. Perform the manual task according to instructions. The Coordinate calibration unit 369GKY-a is located in the Armory. Refer to ESS Odysseus Operations Handbook page 2.19-93 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 520, // X coordinate in image
		mapY: 1650 // Y coordinate in image
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
		description: 'The filter is causing quantum surges that will overload the general hull system if not fixed. The filter’s crystal core needs to be re-attenuated. Manual labor is needed. Perform the manual task according to instructions.The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.12-63 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, corridoor',
		map: 'deck1',
		mapX: 560, // X coordinate in image
		mapY: 890 // Y coordinate in image
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
		description: 'The filter is causing quantum surges that will overload the general hull system if not fixed. The filter’s crystal core needs to be re-attenuated. Manual labor is needed. Perform the manual task according to instructions.The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.12-63 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, corridoor',
		map: 'deck1',
		mapX: 560, // X coordinate in image
		mapY: 890 // Y coordinate in image
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
		description: 'The filter is causing quantum surges that will overload the general hull system if not fixed. The filter’s crystal core needs to be re-attenuated. Manual labor is needed. Perform the manual task according to instructions.The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.12-63 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, corridoor',
		map: 'deck1',
		mapX: 560, // X coordinate in image
		mapY: 890 // Y coordinate in image
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
		description: 'The filter is causing quantum surges that will overload the general hull system if not fixed. The filter’s crystal core needs to be re-attenuated. Manual labor is needed. Perform the manual task according to instructions.The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.12-63 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, corridoor',
		map: 'deck1',
		mapX: 560, // X coordinate in image
		mapY: 890 // Y coordinate in image
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
		description: 'The filter is causing quantum surges that will overload the general hull system if not fixed. The filter’s crystal core needs to be re-attenuated. Manual labor is needed. Perform the manual task according to instructions. The Dorsal ion bio-filter G5He is located in the corridoor. Refer to ESS Odysseus Operations Handbook page 2.12-63 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, corridoor',
		map: 'deck1',
		mapX: 560, // X coordinate in image
		mapY: 890 // Y coordinate in image
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
		description: 'This combination of switchboards manually controls the front shield antilepton commands. Manual labor is needed. Perform the manual task according to instructions. The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.13-30 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, crew bar',
		map: 'deck1',
		mapX: 750, // X coordinate in image
		mapY: 1170 // Y coordinate in image
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
		description: 'This combination of switchboards manually controls the front shield antilepton commands. Manual labor is needed. Perform the manual task according to instructions. The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.13-30 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, crew bar',
		map: 'deck1',
		mapX: 750, // X coordinate in image
		mapY: 1170 // Y coordinate in image
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
		description: 'This combination of switchboards manually controls the front shield antilepton commands. Manual labor is needed. Perform the manual task according to instructions. The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.13-30 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, crew bar',
		map: 'deck1',
		mapX: 750, // X coordinate in image
		mapY: 1170 // Y coordinate in image
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
		description: 'This combination of switchboards manually controls the front shield antilepton commands. Manual labor is needed. Perform the manual task according to instructions. The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.13-30 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, crew bar',
		map: 'deck1',
		mapX: 750, // X coordinate in image
		mapY: 1170 // Y coordinate in image
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
		description: 'This combination of switchboards manually controls the front shield antilepton commands. Manual labor is needed. Perform the manual task according to instructions. The Front shield antilepton control switchboard 473f is located in the crew bar. Refer to ESS Odysseus Operations Handbook page 2.13-30 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, crew bar',
		map: 'deck1',
		mapX: 750, // X coordinate in image
		mapY: 1170 // Y coordinate in image
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
		description: 'This unit functions as a secondary motherboard for programming some key commands for the gamma-wave missile system. Manual labor is needed. Perform the manual task according to instructions. The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.3-65 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 280, // X coordinate in image
		mapY: 990 // Y coordinate in image
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
		description: 'This unit functions as a secondary motherboard for programming some key commands for the gamma-wave missile system. Manual labor is needed. Perform the manual task according to instructions. The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.3-65 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 280, // X coordinate in image
		mapY: 990 // Y coordinate in image
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
		description: 'This unit functions as a secondary motherboard for programming some key commands for the gamma-wave missile system. Manual labor is needed. Perform the manual task according to instructions. The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.3-65 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 280, // X coordinate in image
		mapY: 990 // Y coordinate in image
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
		description: 'This unit functions as a secondary motherboard for programming some key commands for the gamma-wave missile system. Manual labor is needed. Perform the manual task according to instructions. The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.3-65 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 280, // X coordinate in image
		mapY: 990 // Y coordinate in image
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
		description: 'This unit functions as a secondary motherboard for programming some key commands for the gamma-wave missile system. Manual labor is needed. Perform the manual task according to instructions. The Gamma-wave missile driver control unit Rr34c is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.3-65 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 280, // X coordinate in image
		mapY: 990 // Y coordinate in image
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
		description: 'This switchboard re-routes the nitronium flow from the gluon core to the missile propeller systems. In order to ensure the safety of the ship, the nitronium flow needs to be frequently re-routed. Manual labor is needed. Perform the manual task according to instructions. The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.5-31 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 560, // X coordinate in image
		mapY: 1615 // Y coordinate in image
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
		description: 'This switchboard re-routes the nitronium flow from the gluon core to the missile propeller systems. In order to ensure the safety of the ship, the nitronium flow needs to be frequently re-routed. Manual labor is needed. Perform the manual task according to instructions. The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.5-31 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 560, // X coordinate in image
		mapY: 1615 // Y coordinate in image
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
		description: 'This switchboard re-routes the nitronium flow from the gluon core to the missile propeller systems. In order to ensure the safety of the ship, the nitronium flow needs to be frequently re-routed. Manual labor is needed. Perform the manual task according to instructions. The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.5-31 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 560, // X coordinate in image
		mapY: 1615 // Y coordinate in image
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
		description: 'This switchboard re-routes the nitronium flow from the gluon core to the missile propeller systems. In order to ensure the safety of the ship, the nitronium flow needs to be frequently re-routed. Manual labor is needed. Perform the manual task according to instructions. The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.5-31 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 560, // X coordinate in image
		mapY: 1615 // Y coordinate in image
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
		description: 'This switchboard re-routes the nitronium flow from the gluon core to the missile propeller systems. In order to ensure the safety of the ship, the nitronium flow needs to be frequently re-routed. Manual labor is needed. Perform the manual task according to instructions. The Gluon impulse control circuit switchboard 2f345G is located in the armory. Refer to ESS Odysseus Operations Handbook page 2.5-31 for instructions. Use HANSCA repair for calibration.',
		location: 'Lower deck, armory',
		map: 'deck1',
		mapX: 560, // X coordinate in image
		mapY: 1615 // Y coordinate in image
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
		title: 'IEPBR-unit B33e - controlling the power charge A',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions. The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-3 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 305, // X coordinate in image
		mapY: 1200 // Y coordinate in image
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
		title: 'IEPBR-unit B33e - power charge B',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions. The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-3 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 305, // X coordinate in image
		mapY: 1200 // Y coordinate in image
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
		title: 'IEPBR-unit B33e - power charge C',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions. The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-3 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 305, // X coordinate in image
		mapY: 1200 // Y coordinate in image
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
		title: 'IEPBR-unit B33e - power charge D',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions. The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-3 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 305, // X coordinate in image
		mapY: 1200 // Y coordinate in image
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
		title: 'IEPBR-unit B33e - power charge E',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions. The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-3 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 305, // X coordinate in image
		mapY: 1200 // Y coordinate in imagee
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
		title: 'IEPBR-unit B33e - controlling power supply A',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions. The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-2 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 305, // X coordinate in image
		mapY: 1200 // Y coordinate in image
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
		title: 'IEPBR-unit B33e - controlling power supply B',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions. The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-2 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 305, // X coordinate in image
		mapY: 1200 // Y coordinate in image
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
		title: 'IEPBR-unit B33e - controlling power supply C',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions. The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-2 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 305, // X coordinate in image
		mapY: 1200 // Y coordinate in image
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
		title: 'IEPBR-unit B33e - controlling power supply D',
		description: 'This unit controls the backup power for the impulse engine. If any anomalies outside of the normal range occur, it may have a critical effect on the energy supply of the impulse engine. Manual labor is needed. Perform the manual task according to instructions. The Impulse engine backup power regulation unit B33e is located in the bridge. Refer to ESS Odysseus Operations Handbook page 2.6-2 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, bridge',
		map: 'deck2',
		mapX: 305, // X coordinate in image
		mapY: 1200 // Y coordinate in image
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
		description: 'This ventilation unit supports the regulation of the ventilation of the beam weapons system whenever the realignment of the delta-wave drive pedals bears a risk of overheating. Manual labor is needed. Perform the manual task according to instructions. The Isotopic microfilament ventilation unit Nu8-6 is located in the Hive. Refer to ESS Odysseus Operations Handbook page 2.4-45 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, hive',
		map: 'deck2',
		mapX: 950, // X coordinate in image
		mapY: 600 // Y coordinate in image
	},
	{
		id: 'frontshield_x41_a',
		type: 'task',
		game: 'frontshield_x41_a',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 160,
		title: 'Microfilament generator (model X41) anomalities A',
		description: 'This generator is used for coding the command to increase or decrease the power supply to the front shield’s gluon fetcher when it is showing any kind of anomalous power signature. Manual labor is needed. Perform the manual task according to instructions. The Microfilament generator (model X41) is located in the engine room. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 930, // X coordinate in image
		mapY: 1840 // Y coordinate in image
	},
	{
		id: 'frontshield_x41_b',
		type: 'task',
		game: 'frontshield_x41_a',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.17,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 240,
		title: 'Microfilament generator (model X41) anomalities B',
		description: 'This generator is used for coding the command to increase or decrease the power supply to the front shield’s gluon fetcher when it is showing any kind of anomalous power signature. Manual labor is needed. Perform the manual task according to instructions. The Microfilament generator (model X41) is located in the engine room. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 930, // X coordinate in image
		mapY: 1840 // Y coordinate in image
	},
	{
		id: 'frontshield_x41_c',
		type: 'task',
		game: 'frontshield_x41_c',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 120,
		title: 'Microfilament generator (model X41) anomalities C',
		description: 'This generator is used for coding the command to increase or decrease the power supply to the front shield’s gluon fetcher when it is showing any kind of anomalous power signature. Manual labor is needed. Perform the manual task according to instructions. The Microfilament generator (model X41) is located in the engine room. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 930, // X coordinate in image
		mapY: 1840 // Y coordinate in image
	},
	{
		id: 'frontshield_x41_d',
		type: 'task',
		game: 'frontshield_x41_d',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.19,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 240,
		title: 'Microfilament generator (model X41) anomalities D',
		description: 'This generator is used for coding the command to increase or decrease the power supply to the front shield’s gluon fetcher when it is showing any kind of anomalous power signature. Manual labor is needed. Perform the manual task according to instructions. The Microfilament generator (model X41) is located in the engine room. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 930, // X coordinate in image
		mapY: 1840 // Y coordinate in image
	},
	{
		id: 'frontshield_x41_e',
		type: 'task',
		game: 'frontshield_x41_e',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.18,
		status: 'initial',
		calibrationCount: 6,
		calibrationTime: 80,
		title: 'Microfilament generator (model X41) anomalities E',
		description: 'This generator is used for coding the command to increase or decrease the power supply to the front shield’s gluon fetcher when it is showing any kind of anomalous power signature. Manual labor is needed. Perform the manual task according to instructions. The Microfilament generator (model X41) is located in the engine room. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, engineering room',
		map: 'deck2',
		mapX: 930, // X coordinate in image
		mapY: 1840 // Y coordinate in image
	},
	{
		id: 'maneuvering_decetor',
		type: 'task',
		game: 'maneuvering_decetor',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 9,
		calibrationTime: 50,
		title: 'Unidedified articles on Isotopic particle detector K1p (model SICK)',
		description: 'This unit detects any anomalies in isotopic particles and communicates this information to the ship’s central maneuvering system. The isotopic gamma-spore reader needs to be cleaned to ensure optimal performance. Manual labor is needed. Perform the manual task according to instructions. The Isotopic particle detector K1p (model SICK) is located in the war room. Refer to ESS Odysseus Operations Handbook page 2.4-21 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, war room',
		map: 'deck2',
		mapX: 615, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'rearshield_x41_a',
		type: 'task',
		game: 'rearshield_x41_a',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.14,
		status: 'initial',
		calibrationCount: 6,
		calibrationTime: 80,
		title: 'Microfilament generator (model X41) A',
		description: 'This generator is used for coding the command to increase or decrease the power supply to the rear shield’s gluon fetcher when it is showing any kind of anomalous power signature. Manual labor is needed. Perform the manual task according to instructions. The Microfilament generator (model X41) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, science lab',
		map: 'deck2',
		mapX: 1060, // X coordinate in image
		mapY: 770 // Y coordinate in image
	},
	{
		id: 'rearshield_x41_b',
		type: 'task',
		game: 'rearshield_x41_b',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.13,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 150,
		title: 'Microfilament generator (model X41) B',
		description: 'This generator is used for coding the command to increase or decrease the power supply to the rear shield’s gluon fetcher when it is showing any kind of anomalous power signature. Manual labor is needed. Perform the manual task according to instructions. The Microfilament generator (model X41) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, science lab',
		map: 'deck2',
		mapX: 1060, // X coordinate in image
		mapY: 770 // Y coordinate in image
	},
	{
		id: 'rearshield_x41_c',
		type: 'task',
		game: 'rearshield_x41_c',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.16,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 100,
		title: 'Microfilament generator (model X41) C',
		description: 'This generator is used for coding the command to increase or decrease the power supply to the rear shield’s gluon fetcher when it is showing any kind of anomalous power signature. Manual labor is needed. Perform the manual task according to instructions. The Microfilament generator (model X41) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, science lab',
		map: 'deck2',
		mapX: 1060, // X coordinate in image
		mapY: 770 // Y coordinate in image
	},
	{
		id: 'rearshield_x41_d',
		type: 'task',
		game: 'rearshield_x41_d',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 200,
		title: 'Microfilament generator (model X41) D',
		description: 'This generator is used for coding the command to increase or decrease the power supply to the rear shield’s gluon fetcher when it is showing any kind of anomalous power signature. Manual labor is needed. Perform the manual task according to instructions. The Microfilament generator (model X41) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, science lab',
		map: 'deck2',
		mapX: 1060, // X coordinate in image
		mapY: 770 // Y coordinate in image
	},
	{
		id: 'rearshield_x41_e',
		type: 'task',
		game: 'rearshield_x41_e',
		singleUse: false,
		used: false,
		eeType: 'frontshield',
		eeHealth: 0.13,
		status: 'initial',
		calibrationCount: 5,
		calibrationTime: 80,
		title: 'Microfilament generator (model X41) E',
		description: 'This generator is used for coding the command to increase or decrease the power supply to the rear shield’s gluon fetcher when it is showing any kind of anomalous power signature. Manual labor is needed. Perform the manual task according to instructions. The Microfilament generator (model X41) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-5 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, science lab',
		map: 'deck2',
		mapX: 1060, // X coordinate in image
		mapY: 770 // Y coordinate in image
	},
	{
		id: 'beam_neogenic_a',
		type: 'task',
		game: 'beam_neogenic_a',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.04,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 30,
		title: 'Neogenic capacitator GR3914D gamma-wave shifter A',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. The ship’s beam weapons system relies on the support of the gamma-wave shifter to keep power surges within an acceptable range. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D - controlling the power of the gamma-wave shifter is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'beam_neogenic_b',
		type: 'task',
		game: 'beam_neogenic_b',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.04,
		status: 'initial',
		calibrationCount: 10,
		calibrationTime: 7,
		title: 'Neogenic capacitator GR3914D gamma-wave shifter B',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. The ship’s beam weapons system relies on the support of the gamma-wave shifter to keep power surges within an acceptable range. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D - controlling the power of the gamma-wave shifter is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'missile_neogenic_a',
		type: 'task',
		game: 'missile_neogenic_a',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 210,
		title: 'Neogenic capacitator GR3914D delta-wave fuse box A',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. The missile system is observed to be producing abnormal delta-wave pulse signatures. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'missile_neogenic_b',
		type: 'task',
		game: 'missile_neogenic_b',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.13,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 140,
		title: 'Neogenic capacitator GR3914D delta-wave fuse box B',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. The missile system is observed to be producing abnormal delta-wave pulse signatures. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'missile_neogenic_c',
		type: 'task',
		game: 'missile_neogenic_c',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 100,
		title: 'Neogenic capacitator GR3914D delta-wave fuse box C',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. The missile system is observed to be producing abnormal delta-wave pulse signatures. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'missile_neogenic_d',
		type: 'task',
		game: 'missile_neogenic_d',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.13,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 410,
		title: 'Neogenic capacitator GR3914D delta-wave fuse box D',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. The missile system is observed to be producing abnormal delta-wave pulse signatures. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'missile_neogenic_e',
		type: 'task',
		game: 'missile_neogenic_e',
		singleUse: false,
		used: false,
		eeType: 'missilesystem',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 5,
		calibrationTime: 80,
		title: 'Neogenic capacitator GR3914D delta-wave fuse box E',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. The missile system is observed to be producing abnormal delta-wave pulse signatures. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'hull_neogenic_a',
		type: 'task',
		game: 'hull_neogenic_a',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 330,
		title: 'Neogenic capacitator GR3914D dilithium ccc signals A',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. This unit also contains the dilithium containment core control panel. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'hull_neogenic_b',
		type: 'task',
		game: 'hull_neogenic_b',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.10,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 200,
		title: 'Neogenic capacitator GR3914D dilithium ccc signals B',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. This unit also contains the dilithium containment core control panel. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'hull_neogenic_c',
		type: 'task',
		game: 'hull_neogenic_c',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 160,
		title: 'Neogenic capacitator GR3914D dilithium ccc signals C',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. This unit also contains the dilithium containment core control panel. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'hull_neogenic_d',
		type: 'task',
		game: 'hull_neogenic_d',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.10,
		status: 'initial',
		calibrationCount: 8,
		calibrationTime: 80,
		title: 'Neogenic capacitator GR3914D dilithium ccc signals D',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. This unit also contains the dilithium containment core control panel. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'hull_neogenic_e',
		type: 'task',
		game: 'hull_neogenic_e',
		singleUse: false,
		used: false,
		eeType: 'hull',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 5,
		calibrationTime: 130,
		title: 'Neogenic capacitator GR3914D dilithium ccc signals E',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. This unit also contains the dilithium containment core control panel. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'rearshield_neogenic',
		type: 'task',
		game: 'rearshield_neogenic',
		singleUse: false,
		used: false,
		eeType: 'rearshield',
		eeHealth: 0.05,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 22,
		title: 'Neogenic capacitator GR3914D positronic stabilizer',
		description: 'This capacitator supports the correct functioning of several of the ship’s systems. In case of temporal anomalies, the rear shield’s positronic stabilizer should be resynchronised. Manual labor is needed. Perform the manual task according to instructions. The Neogenic capacitator GR3914D is located in the security room. Refer to ESS Odysseus Operations Handbook page 3-99 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, security room',
		map: 'deck2',
		mapX: 255, // X coordinate in image
		mapY: 1895 // Y coordinate in image
	},
	{
		id: 'maneuvering_y99z_a',
		type: 'task',
		game: 'maneuvering_y99z_a',
		singleUse: false,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 420,
		title: 'Promethium warp fragmentor Y99z A',
		description: 'The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system. Manual labor is needed. Perform the manual task according to instructions. The Promethium warp fragmentor Y99z is located in the med bay. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, med bay',
		map: 'deck2',
		mapX: 180, // X coordinate in image
		mapY: 1640 // Y coordinate in image
	},
	{
		id: 'maneuvering_y99z_b',
		type: 'task',
		game: 'maneuvering_y99z_b',
		singleUse: false,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.13,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 140,
		title: 'Promethium warp fragmentor Y99z B',
		description: 'The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system. Manual labor is needed. Perform the manual task according to instructions. The Promethium warp fragmentor Y99z is located in the med bay. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, med bay',
		map: 'deck2',
		mapX: 180, // X coordinate in image
		mapY: 1640 // Y coordinate in image
	},
	{
		id: 'maneuvering_y99z_c',
		type: 'task',
		game: 'maneuvering_y99z_c',
		singleUse: false,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 5,
		calibrationTime: 80,
		title: 'Promethium warp fragmentor Y99z C',
		description: 'The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system. Manual labor is needed. Perform the manual task according to instructions. The Promethium warp fragmentor Y99z is located in the med bay. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, med bay',
		map: 'deck2',
		mapX: 180, // X coordinate in image
		mapY: 1640 // Y coordinate in image
	},
	{
		id: 'maneuvering_y99z_d',
		type: 'task',
		game: 'maneuvering_y99z_d',
		singleUse: false,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 100,
		title: 'Promethium warp fragmentor Y99z D',
		description: 'The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system. Manual labor is needed. Perform the manual task according to instructions. The Promethium warp fragmentor Y99z is located in the med bay. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, med bay',
		map: 'deck2',
		mapX: 180, // X coordinate in image
		mapY: 1640 // Y coordinate in image
	},
	{
		id: 'maneuvering_y99z_e',
		type: 'task',
		game: 'maneuvering_y99z_a',
		singleUse: false,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.10,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 140,
		title: 'Promethium warp fragmentor Y99z E',
		description: 'The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system. Manual labor is needed. Perform the manual task according to instructions. The Promethium warp fragmentor Y99z is located in the med bay. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, med bay',
		map: 'deck2',
		mapX: 180, // X coordinate in image
		mapY: 1640 // Y coordinate in image
	},



	{
		id: 'maneuvering_y99y_a',
		type: 'task',
		game: 'maneuvering_y99y_a',
		singleUse: false,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 420,
		title: 'Promethium warp fragmentor Y99y A',
		description: 'The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system. Manual labor is needed. Perform the manual task according to instructions. The Promethium warp fragmentor Y99y is located in the captains quarters. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, captains quarters',
		map: 'deck2',
		mapX: 385, // X coordinate in image
		mapY: 820 // Y coordinate in image
	},
	{
		id: 'maneuvering_y99y_b',
		type: 'task',
		game: 'maneuvering_y99y_b',
		singleUse: false,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 420,
		title: 'Promethium warp fragmentor Y99y B',
		description: 'The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system. Manual labor is needed. Perform the manual task according to instructions. The Promethium warp fragmentor Y99y is located in the captains quarters. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, captains quarters',
		map: 'deck2',
		mapX: 385, // X coordinate in image
		mapY: 820 // Y coordinate in image
	},
	{
		id: 'maneuvering_y99y_c',
		type: 'task',
		game: 'maneuvering_y99y_c',
		singleUse: false,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 420,
		title: 'Promethium warp fragmentor Y99y C',
		description: 'The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system. Manual labor is needed. Perform the manual task according to instructions. The Promethium warp fragmentor Y99y is located in the captains quarters. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, captains quarters',
		map: 'deck2',
		mapX: 385, // X coordinate in image
		mapY: 820 // Y coordinate in image
	},
	{
		id: 'maneuvering_y99y_d',
		type: 'task',
		game: 'maneuvering_y99y_d',
		singleUse: false,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 420,
		title: 'Promethium warp fragmentor Y99y D',
		description: 'The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system. Manual labor is needed. Perform the manual task according to instructions. The Promethium warp fragmentor Y99y is located in the captains quarters. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, captains quarters',
		map: 'deck2',
		mapX: 385, // X coordinate in image
		mapY: 820 // Y coordinate in image
	},
	{
		id: 'maneuvering_y99y_e',
		type: 'task',
		game: 'maneuvering_y99y_b',
		singleUse: false,
		used: false,
		eeType: 'maneuvering',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 420,
		title: 'Promethium warp fragmentor Y99y B',
		description: 'The promethium warp fragmenter is an indispensable, usually autonomously operating part of the maneuvering system. The coding panel is used to manually re-code the system. Manual labor is needed. Perform the manual task according to instructions. The Promethium warp fragmentor Y99y is located in the captains quarters. Refer to ESS Odysseus Operations Handbook page 3-20 for instructions. Use HANSCA repair for calibration.',
		location: 'Upper deck, captains quarters',
		map: 'deck2',
		mapX: 385, // X coordinate in image
		mapY: 820 // Y coordinate in image
	},
	{
		id: 'reactor_464_a',
		type: 'task',
		game: 'reactor_464_a',
		singleUse: false,
		used: false,
		eeType: 'reactor',
		eeHealth: 0.27,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 240,
		title: 'Radiation containment switch 464-900 A',
		description: 'This switch is used to reroute energy to alternative charge splitters when there’s a risk of buildup of alpha and beta particles. Manual labor is needed. Perform the manual task according to instructions. The Radiation containment switch 464-900 is located above the mess hall. Refer to ESS Odysseus Operations Handbook page 3-186 for instructions. Use HANSCA repair for calibration.',
		location: '3rd deck, above mess hall',
		map: 'deck3',
		mapX: 135, // X coordinate in image
		mapY: 130 // Y coordinate in image
	},
	{
		id: 'reactor_464_b',
		type: 'task',
		game: 'reactor_464_a',
		singleUse: false,
		used: false,
		eeType: 'reactor',
		eeHealth: 0.23,
		status: 'initial',
		calibrationCount: 9,
		calibrationTime: 80,
		title: 'Radiation containment switch 464-900 B',
		description: 'This switch is used to reroute energy to alternative charge splitters when there’s a risk of buildup of alpha and beta particles. Manual labor is needed. Perform the manual task according to instructions. The Radiation containment switch 464-900 is located above the mess hall. Refer to ESS Odysseus Operations Handbook page 3-186 for instructions. Use HANSCA repair for calibration.',
		location: '3rd deck, above mess hall',
		map: 'deck3',
		mapX: 135, // X coordinate in image
		mapY: 130 // Y coordinate in image
	},
	{
		id: 'reactor_464_c',
		type: 'task',
		game: 'reactor_464_a',
		singleUse: false,
		used: false,
		eeType: 'reactor',
		eeHealth: 0.26,
		status: 'initial',
		calibrationCount: 5,
		calibrationTime: 150,
		title: 'Radiation containment switch 464-900 C',
		description: 'This switch is used to reroute energy to alternative charge splitters when there’s a risk of buildup of alpha and beta particles. Manual labor is needed. Perform the manual task according to instructions. The Radiation containment switch 464-900 is located above the mess hall. Refer to ESS Odysseus Operations Handbook page 3-186 for instructions. Use HANSCA repair for calibration.',
		location: '3rd deck, above mess hall',
		map: 'deck3',
		mapX: 135, // X coordinate in image
		mapY: 130 // Y coordinate in image
	},
	// {
	// 	id: 'rearshield_lubricator_a',
	// 	type: 'task',
	// 	game: 'rearshield_lubricator_a',
	// 	singleUse: false,
	// 	used: false,
	// 	eeType: 'rearshield',
	// 	eeHealth: 0.09,
	// 	status: 'initial',
	// 	calibrationCount: 5,
	// 	calibrationTime: 60,
	// 	title: 'Revolving pulse turbine lubricator switch 53r A',
	// 	description: 'This switch re-attenuates the revolving pulse signals that drive the rear shield’s quantum portal bracket. If the rear shield suffers any kind of damage, this switch helps to ensure the shield remains up. Manual labor is needed. Perform the manual task according to instructions. The Revolving pulse turbine lubricator switch 53r is located in the war room. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
	// 	location: '2rd deck, war room',
	// 	map: 'deck2',
	// 	mapX: 615, // X coordinate in image
	// 	mapY: 1895 // Y coordinate in image
	// },
	// {
	// 	id: 'rearshield_lubricator_b',
	// 	type: 'task',
	// 	game: 'rearshield_lubricator_b',
	// 	singleUse: false,
	// 	used: false,
	// 	eeType: 'rearshield',
	// 	eeHealth: 0.09,
	// 	status: 'initial',
	// 	calibrationCount: 3,
	// 	calibrationTime: 100,
	// 	title: 'Revolving pulse turbine lubricator switch 53r B',
	// 	description: 'This switch re-attenuates the revolving pulse signals that drive the rear shield’s quantum portal bracket. If the rear shield suffers any kind of damage, this switch helps to ensure the shield remains up. Manual labor is needed. Perform the manual task according to instructions. The Revolving pulse turbine lubricator switch 53r is located in the war room. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
	// 	location: '2rd deck, war room',
	// 	map: 'deck2',
	// 	mapX: 615, // X coordinate in image
	// 	mapY: 1895 // Y coordinate in image
	// },

	// {
	// 	id: 'rearshield_lubricator_c',
	// 	type: 'task',
	// 	game: 'rearshield_lubricator_c',
	// 	singleUse: false,
	// 	used: false,
	// 	eeType: 'rearshield',
	// 	eeHealth: 0.09,
	// 	status: 'initial',
	// 	calibrationCount: 3,
	// 	calibrationTime: 100,
	// 	title: 'Revolving pulse turbine lubricator switch 53r C',
	// 	description: 'This switch re-attenuates the revolving pulse signals that drive the rear shield’s quantum portal bracket. If the rear shield suffers any kind of damage, this switch helps to ensure the shield remains up. Manual labor is needed. Perform the manual task according to instructions. The Revolving pulse turbine lubricator switch 53r is located in the war room. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
	// 	location: '2rd deck, war room',
	// 	map: 'deck2',
	// 	mapX: 615, // X coordinate in image
	// 	mapY: 1895 // Y coordinate in image
	// },
	// {
	// 	id: 'rearshield_lubricator_d',
	// 	type: 'task',
	// 	game: 'rearshield_lubricator_d',
	// 	singleUse: false,
	// 	used: false,
	// 	eeType: 'rearshield',
	// 	eeHealth: 0.1,
	// 	status: 'initial',
	// 	calibrationCount: 2,
	// 	calibrationTime: 150,
	// 	title: 'Revolving pulse turbine lubricator switch 53r D',
	// 	description: 'This switch re-attenuates the revolving pulse signals that drive the rear shield’s quantum portal bracket. If the rear shield suffers any kind of damage, this switch helps to ensure the shield remains up. Manual labor is needed. Perform the manual task according to instructions. The Revolving pulse turbine lubricator switch 53r is located in the war room. Refer to ESS Odysseus Operations Handbook page 2.6-56 for instructions. Use HANSCA repair for calibration.',
	// 	location: '2rd deck, war room',
	// 	map: 'deck2',
	// 	mapX: 615, // X coordinate in image
	// 	mapY: 1895 // Y coordinate in image
	// },
	{
		id: 'doomba',
		type: 'task',
		game: 'doomba',
		singleUse: false,
		used: false,
		eeType: 'lifesupport',
		eeHealth: 0.2,
		status: 'initial',
		calibrationCount: 1,
		calibrationTime: 870,
		title: 'Roomba (old model, brand: Samsung)',
		description: 'The roomba does a decent job at keeping the corridors clean. This model is equipped with a Hyperclean function, which is useful for heavy duty maintenance on larger surfaces. Manual labor is needed. Perform the manual task according to instructions. The Roomba (old model, brand: Samsung) is located in the green room. Refer to ESS Odysseus Operations Handbook page 3-219 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, green room',
		map: 'deck2',
		mapX: 990, // X coordinate in image
		mapY: 885 // Y coordinate in image
	},
	{
		id: 'beam_voltmeter_a',
		type: 'task',
		game: 'beam_voltmeter_a',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.08,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 130,
		title: 'Versatile Voltmeter B7-17 (model 562) A',
		description: ' This Voltmeter is used to synchronize the argon quantum shift propulsion of the beam weapons in order to ensure faultless and safe usage. Manual labor is needed. Perform the manual task according to instructions. The Versatile Voltmeter B7-17 (model 562) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-49 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, science lab',
		map: 'deck2',
		mapX: 1250, // X coordinate in image
		mapY: 830 // Y coordinate in image
	},
	{
		id: 'beam_voltmeter_b',
		type: 'task',
		game: 'beam_voltmeter_b',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.08,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 130,
		title: 'Versatile Voltmeter B7-17 (model 562) B',
		description: ' This Voltmeter is used to synchronize the argon quantum shift propulsion of the beam weapons in order to ensure faultless and safe usage. Manual labor is needed. Perform the manual task according to instructions. The Versatile Voltmeter B7-17 (model 562) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-49 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, science lab',
		map: 'deck2',
		mapX: 1250, // X coordinate in image
		mapY: 830 // Y coordinate in image
	},
	{
		id: 'beam_voltmeter_c',
		type: 'task',
		game: 'beam_voltmeter_c',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.08,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 90,
		title: 'Versatile Voltmeter B7-17 (model 562) C',
		description: ' This Voltmeter is used to synchronize the argon quantum shift propulsion of the beam weapons in order to ensure faultless and safe usage. Manual labor is needed. Perform the manual task according to instructions. The Versatile Voltmeter B7-17 (model 562) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-49 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, science lab',
		map: 'deck2',
		mapX: 1250, // X coordinate in image
		mapY: 830 // Y coordinate in image
	},
	{
		id: 'beam_voltmeter_d',
		type: 'task',
		game: 'beam_voltmeter_d',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.09,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 90,
		title: 'Versatile Voltmeter B7-17 (model 562) D',
		description: ' This Voltmeter is used to synchronize the argon quantum shift propulsion of the beam weapons in order to ensure faultless and safe usage. Manual labor is needed. Perform the manual task according to instructions. The Versatile Voltmeter B7-17 (model 562) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-49 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, science lab',
		map: 'deck2',
		mapX: 1250, // X coordinate in image
		mapY: 830 // Y coordinate in image
	},
	{
		id: 'beam_voltmeter_e',
		type: 'task',
		game: 'beam_voltmeter_a',
		singleUse: false,
		used: false,
		eeType: 'beamweapons',
		eeHealth: 0.08,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 130,
		title: 'Versatile Voltmeter B7-17 (model 562) E',
		description: ' This Voltmeter is used to synchronize the argon quantum shift propulsion of the beam weapons in order to ensure faultless and safe usage. Manual labor is needed. Perform the manual task according to instructions. The Versatile Voltmeter B7-17 (model 562) is located in the science lab. Refer to ESS Odysseus Operations Handbook page 2.8-49 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, science lab',
		map: 'deck2',
		mapX: 1250, // X coordinate in image
		mapY: 830 // Y coordinate in image
	},
	{
		id: 'impulse_reroute_a',
		type: 'task',
		game: 'impulse_reroute_a',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 210,
		title: 'Zirconium gluon gel core control panel - Re-routing control signals A',
		description: 'This control panel is used to manually control the zirconium gluon core that propels the impulse engine. It can be used for re-routing control signals for zirconium containment. Manual labor is needed. Perform the manual task according to instructions. The Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-32 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, med bay',
		map: 'deck2',
		mapX: 172, // X coordinate in image
		mapY: 1347 // Y coordinate in image
	},
	{
		id: 'impulse_reroute_b',
		type: 'task',
		game: 'impulse_reroute_b',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.10,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 105,
		title: 'Zirconium gluon gel core control panel - Re-routing control signals B',
		description: 'This control panel is used to manually control the zirconium gluon core that propels the impulse engine. It can be used for re-routing control signals for zirconium containment. Manual labor is needed. Perform the manual task according to instructions. The Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-32 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, med bay',
		map: 'deck2',
		mapX: 172, // X coordinate in image
		mapY: 1347 // Y coordinate in image
	},
	{
		id: 'impulse_reroute_c',
		type: 'task',
		game: 'impulse_reroute_c',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.10,
		status: 'initial',
		calibrationCount: 4,
		calibrationTime: 105,
		title: 'Zirconium gluon gel core control panel - Re-routing control signals C',
		description: 'This control panel is used to manually control the zirconium gluon core that propels the impulse engine. It can be used for re-routing control signals for zirconium containment. Manual labor is needed. Perform the manual task according to instructions. The Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-32 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, med bay',
		map: 'deck2',
		mapX: 172, // X coordinate in image
		mapY: 1347 // Y coordinate in image
	},
	{
		id: 'impulse_reroute_d',
		type: 'task',
		game: 'impulse_reroute_d',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 210,
		title: 'Zirconium gluon gel core control panel - Re-routing control signals D',
		description: 'This control panel is used to manually control the zirconium gluon core that propels the impulse engine. It can be used for re-routing control signals for zirconium containment. Manual labor is needed. Perform the manual task according to instructions. The Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-32 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, med bay',
		map: 'deck2',
		mapX: 172, // X coordinate in image
		mapY: 1347 // Y coordinate in image
	},
	{
		id: 'impulse_reroute_e',
		type: 'task',
		game: 'impulse_reroute_e',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.11,
		status: 'initial',
		calibrationCount: 2,
		calibrationTime: 210,
		title: 'Zirconium gluon gel core control panel - Re-routing control signals E',
		description: 'This control panel is used to manually control the zirconium gluon core that propels the impulse engine. It can be used for re-routing control signals for zirconium containment. Manual labor is needed. Perform the manual task according to instructions. The Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-32 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, med bay',
		map: 'deck2',
		mapX: 172, // X coordinate in image
		mapY: 1347 // Y coordinate in image
	},
	{
		id: 'impulse_reset_a',
		type: 'task',
		game: 'impulse_reset_a',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 120,
		title: 'Zirconium gluon gel core control panel - System reprogramming A',
		description: 'This control panel is used to manually control the zirconium gluon core that propels the impulse engine. It can be used for resetting and reprogramming the system whenever a potentially critical plasma surge occurs. Manual labor is needed. Perform the manual task according to instructions. The Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-35 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, med bay',
		map: 'deck2',
		mapX: 172, // X coordinate in image
		mapY: 1347 // Y coordinate in image
	},
	{
		id: 'impulse_reset_b',
		type: 'task',
		game: 'impulse_reset_b',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 120,
		title: 'Zirconium gluon gel core control panel - System reprogramming B',
		description: 'This control panel is used to manually control the zirconium gluon core that propels the impulse engine. It can be used for resetting and reprogramming the system whenever a potentially critical plasma surge occurs. Manual labor is needed. Perform the manual task according to instructions. The Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-35 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, med bay',
		map: 'deck2',
		mapX: 172, // X coordinate in image
		mapY: 1347 // Y coordinate in image
	},
	{
		id: 'impulse_reset_c',
		type: 'task',
		game: 'impulse_reset_c',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 120,
		title: 'Zirconium gluon gel core control panel - System reprogramming C',
		description: 'This control panel is used to manually control the zirconium gluon core that propels the impulse engine. It can be used for resetting and reprogramming the system whenever a potentially critical plasma surge occurs. Manual labor is needed. Perform the manual task according to instructions. The Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-35 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, med bay',
		map: 'deck2',
		mapX: 172, // X coordinate in image
		mapY: 1347 // Y coordinate in image
	},
	{
		id: 'impulse_reset_d',
		type: 'task',
		game: 'impulse_reset_d',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 120,
		title: 'Zirconium gluon gel core control panel - System reprogramming D',
		description: 'This control panel is used to manually control the zirconium gluon core that propels the impulse engine. It can be used for resetting and reprogramming the system whenever a potentially critical plasma surge occurs. Manual labor is needed. Perform the manual task according to instructions. The Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-35 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, med bay',
		map: 'deck2',
		mapX: 172, // X coordinate in image
		mapY: 1347 // Y coordinate in image
	},
	{
		id: 'impulse_reset_e',
		type: 'task',
		game: 'impulse_reset_e',
		singleUse: false,
		used: false,
		eeType: 'impulse',
		eeHealth: 0.12,
		status: 'initial',
		calibrationCount: 3,
		calibrationTime: 120,
		title: 'Zirconium gluon gel core control panel - System reprogramming E',
		description: 'This control panel is used to manually control the zirconium gluon core that propels the impulse engine. It can be used for resetting and reprogramming the system whenever a potentially critical plasma surge occurs. Manual labor is needed. Perform the manual task according to instructions. The Zirconium gluon gel core control panel is located in the med bay. Refer to ESS Odysseus Operations Handbook page 2.4-35 for instructions. Use HANSCA repair for calibration.',
		location: '2rd deck, med bay',
		map: 'deck2',
		mapX: 172, // X coordinate in image
		mapY: 1347 // Y coordinate in image
	},


].forEach(blob => blobs.push(blob));

export default blobs;