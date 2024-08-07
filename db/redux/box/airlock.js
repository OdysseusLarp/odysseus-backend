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
		fighter_launch_delay: 19000,  // milliseconds before depressurization starts on fighter launch
		jump_close_delay: 42000,      // milliseconds before door closes after jump initiation
		auto_close_delay: 0,          // milliseconds before door closes automatically after opening (0 = never)
		// auto-depressurize when any fighters are launched
		fighter_pads: ['landingPadStatus1', 'landingPadStatus2', 'landingPadStatus3'],
		// DMX events to fire on transition start
		dmx_events: {
			open: 'HangarBayDoorUnlock',
			close: 'HangarBayDoorLock',
			fighter_launch: 'HangarBayFighterLaunch',
			depressurize: 'HangarBayDepressurize',
			pressurize: 'HangarBayPressurize',
		},
		// custom transition durations (milliseconds)
		transition_times: {
			depressurize: 5500,  // activated automatically when any fighters are launched
			pressurize: 23000,  // activated automatically when all fighters return
		},
		// custom UI strings
		messages: {
			status_vacuum: 'Fighters on mission',
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
		title_bar_text: 'Airlock 01', // shown in an extra bar at the top of the UI, if set
		allow_depressurize: true,     // should the depressurize button be shown in the player UI?
		jump_close_delay: 10000,      // milliseconds before door closes after jump initiation
		auto_close_delay: 0,          // milliseconds before door closes automatically after opening (0 = never)
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
