const blobs = [];

blobs.push({
	type: 'box',
	id: 'airlock_hangarbay',
	status: 'closed',   // changing this triggers backend logic that updates the values below
	malfunction: false, // set this flag to prevent door from opening after pressurization

	// these are all automatically set by the src/rules/boxes/airlock.js based on the status above
	pressure: 1.0,
	door_open: false,
	transition_status: null,
	countdown_to: 0,

	config: {
		// transition time delays (milliseconds)
		pressurize: {
			start_delay: 0,   // milliseconds to pause before pressure starts climbing
			duration: 30000,  // milliseconds to go from 0% to 100% pressure
			end_delay: 5000,  // milliseconds to pause between 100% pressure and door opening
			malfunction_delay: 3000  // milliseconds after 100% to detect door malfunction
		},
		depressurize: {
			start_delay: 10000,  // milliseconds to pause (and close door) before pressure starts dropping
			duration: 23000,     // milliseconds to go from 100% to 0% pressure
			end_delay: 2000      // milliseconds to pause after 0% pressure is reached
		},
		auto_close_delay: 15000,  // milliseconds before door closes automatically (0 = never)
		dmx: {
			airlock_open: 'HangarBayAirlockOpen',
			airlock_close: 'HangarBayAirlockClose',
		},
		status_messages: {
			pressurize_start: 'Pressurizing',
			pressurize_airflow: 'Pressurizing',
			pressurize_end: 'Unlocking door',
			open: 'Door unlocked',
			malfunction: 'Door malfunction',
			closed: 'Door locked',
			depressurize_start: 'Close the door',
			depressurize_airflow: 'Depressurizing',
			depressurize_end: 'Depressurizing',
			vacuum: 'Vacuum',
			error: 'Error',
			default: 'Nominal',  // unused?
		},
		door_states: {
			open: 'Unlocked',
			depressurize_start: 'Locking',
			pressurize_end: 'Unlocking',
			default: 'Locked',
		},
		countdown_titles: {
			depressurize_start: 'Time to depressurization',
			depressurizing: 'Time to vacuum',
			pressurizing: 'Unlocking door in',
			auto_closing: 'Locking door in',
		},
		audio: {
			// TODO
		}
	},
});

blobs.push({
	type: 'box',
	id: 'airlock_main',
	status: 'closed',
	malfunction: false,

	pressure: 1.0,
	door_open: false,
	transition_status: null,
	countdown_to: 0,

	config: {
		pressurize: {
			start_delay: 0,
			duration: 50000,
			end_delay: 10000,      // TODO: how long does the door take to open?
			malfunction_delay: 0,  // should be unused
		},
		depressurize: {
			start_delay: 10000,    // TODO: how long does the door take to close?
			duration: 600000,      // 10 minutes(!)
			end_delay: 2000,
		},
		auto_close_delay: 0,     // never auto-close the main airlock (safety!)
		dmx: {
			airlock_open: 'MainAirlockOpen',
			airlock_close: 'MainAirlockClose',
		},
		status_messages: {
			pressurize_start: 'Pressurizing',
			pressurize_airflow: 'Pressurizing',
			pressurize_end: 'Opening door',
			open: 'Door open',
			malfunction: 'Door malfunction',  // unused?
			closed: 'Door closed',
			depressurize_start: 'Closing door',
			depressurize_airflow: 'Depressurizing',
			depressurize_end: 'Depressurizing',
			vacuum: 'Vacuum',
			error: 'Error',
			default: 'Nominal',  // unused?
		},
		door_states: {
			open: 'Open',
			depressurize_start: 'Closing',
			default: 'Closed',
			pressurize_end: 'Opening',
		},
		countdown_titles: {
			depressurize_start: 'Time to depressurization',
			depressurizing: 'Time to vacuum',
			pressurizing: 'Opening door in',
			auto_closing: 'Closing door in',  // unused
		},
		audio: {
			// TODO
		}
	},
});

export default blobs;
