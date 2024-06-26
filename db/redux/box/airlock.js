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
		title_bar_text: 'Hangar Bay', // shown in an extra bar at the top of the UI, if set
		allow_depressurize: false,    // should the depressurize button be shown in the player UI?
		auto_close_delay: 15000,      // milliseconds before door closes automatically (0 = never)
		// DMX events to fire on transition start
		dmx_events: {
			open: 'HangarBayDoorUnlock',
			close: 'HangarBayDoorLock',
		},
		// custom transition durations (milliseconds)
		transition_times: {},
		// custom UI strings
		messages: {},
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
		title_bar_text: 'Airlock 01', // shown in an extra bar at the top of the UI, if set
		allow_depressurize: true,     // should the depressurize button be shown in the player UI?
		auto_close_delay: 0,          // milliseconds before door closes automatically (0 = never)
		auto_pressurize_delay: 30000, // milliseconds before airlock re-pressurizes automatically (0 = never)
		pressure_curve: 'sqrt',       // adjustment applied to player-visible pressure value
		// DMX events to fire on transition start
		dmx_events: {
			open: 'MainAirlockDoorUnlock',
			close: 'MainAirlockDoorLock',
			pressurize: 'MainAirlockPressurize',
			depressurize: 'MainAirlockDepressurizeSlow',
			evacuate: 'MainAirlockDepressurizeFast',
		},
		// custom transition durations (milliseconds)
		transition_times: {},
		// custom UI strings
		messages: {},
	},
});

export default blobs;
