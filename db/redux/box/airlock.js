const blobs = [];

blobs.push({
	type: 'box',
	id: 'airlock_hangarbay',
	status: 'initial',

	command: null,  // set this to send a command to the backend

	// these are automatically updated by src/rules/boxes/airlock.js; don't set them manually!
	pressure: 1.0,      // 0 to 1; can also be an object like {t0: timestamp, t1: timestamp, p0: pressure, p1: pressure} during (de)pressurization
	countdown_to: 0,    // timestamp to count down to
	last_command: null, // last command given
	last_command_at: 0, // last command timestamp

	config: {
		linked_task_type: 'box', // type of task that controls whether door can open
		linked_task_id: null,    // ID of task that controls whether door can open
		auto_close_delay: 15000,   // milliseconds before door closes automatically (0 = never)
		pressure_curve: 'sigmoid', // adjustment applied to player-visible pressure value
		title_bar_text: null,      // shown in an extra bar at the top of the UI, if set
		// transition durations (milliseconds)
		transition_times: {
			open: 5000,
			close: 5000,
			malfunction: 2000,
			pressurize: 30000,
			depressurize: 30000,
		},
		// DMX events to fire on transition start
		dmx_events: {
			open: 'HangarBayDoorOpen',
			close: 'HangarBayDoorClose',
			malfunction: 'HangarBayDoorMalfunction',
			pressurize: 'HangarBayPressurize',
			depressurize: 'HangarBayDepressurize',
		},
		// custom UI strings
		messages: {
			// main status box messages
		  status_open: 'Door unlocked',
		  status_opening: 'Unlocking door',
		  status_closing: 'Locking door',
		  status_malfunction: 'Door malfunction',
		  status_closed: 'Door locked',
		  // door status messages
		  door_open: 'Unlocked',
		  door_opening: 'Unlocking',
		  door_closing: 'Locking',
		  door_closed: 'Locked',
		  // button actions
		  button_open: '<< Unlock door >>',
		  button_close: '>> Lock door <<',
		  // countdown titles
		  countdown_opening: 'Unlocking door in',
		  countdown_closing: 'Locking door in',
		},
	},
});

blobs.push({
	type: 'box',
	id: 'airlock_main',
	status: 'initial',

	command: null,  // set this to send a command to the backend

	// these are automatically updated by src/rules/boxes/airlock.js
	pressure: 1.0,   // 0 to 1; can also be an object like {t0: timestamp, t1: timestamp, p0: pressure, p1: pressure} during (de)pressurization
	countdown_to: 0, // timestamp to count down to
	last_command: null, // last command given
	last_command_at: 0, // last command timestamp

	config: {
		linked_task_type: 'box', // type of task that controls whether door can open
		linked_task_id: null,    // ID of task that controls whether door can open
		auto_close_delay: 0,     // milliseconds before door closes automatically (0 = never)
		pressure_curve: 'sqrt',  // adjustment applied to player-visible pressure value
		title_bar_text: 'Main Airlock',  // shown in an extra bar at the top of the UI, if set
		// transition durations (milliseconds)
		transition_times: {
			open: 8000,
			close: 12500,
			malfunction: 2000,
			pressurize: 50000,
			depressurize: 600000,
		},
		// DMX events to fire on transition start
		dmx_events: {
			open: 'MainAirlockDoorOpen',
			close: 'MainAirlockDoorClose',
			malfunction: 'MainAirlockDoorMalfunction',
			pressurize: 'MainAirlockPressurize',
			depressurize: 'MainAirlockDepressurize',
		},
		// custom UI strings
		messages: {},
	},
});

export default blobs;
