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
	eeType: 'reactor',        // What EE health this is related to (omit or put e.g. 'reactor-notyet' for non-EE-bound)
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

export default blobs;
