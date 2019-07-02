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
		confirm_close_message: null,  // confirm close action in admin UI (set for main airlock!)
		// transition durations (milliseconds)
		transition_times: {
			open: 5000,
			close: 5000,
			malfunction: 15000,
			pressurize: 33000,
			depressurize: 32000,
		},
		// DMX events to fire on transition start
		dmx_events: {
			open: 'HangarBayDoorUnlock',
			close: 'HangarBayDoorLock',
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
			status_vacuum: 'Open to space',
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
		title_bar_text: null,  // shown in an extra bar at the top of the UI, if set
		confirm_close_message: 'Warning: Closing will physically lower door! Make sure nobody stands below!',  // confirm close action in admin UI (set for main airlock!)
		// transition durations (milliseconds)
		transition_times: {
			open: 8000,
			close: 32000,
			malfunction: 2000,
			pressurize: 52000,
			depressurize: 601500,
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
		messages: {
			status_vacuum: 'Open to space',
		},
	},
});

export default blobs;
