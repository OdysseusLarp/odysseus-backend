const blobs = [];

blobs.push({
	type: 'box',
	id: 'airlock_hangarbay',
	status: 'open',
	pressure: 1.0,

	transition_status: null,
	countdown_to: 0,
	malfunction: false,

	config: {
		// transition time delays (milliseconds)
		pressurize: {
			start_delay: 2000,
			duration: 25000,
			end_delay: 3000,
			malfunction_delay: 2000,
		},
		depressurize: {
			start_delay: 10000,
			duration: 20000,
			end_delay: 0,
		},
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
			depressurize_start: 'Locking door',
			depressurize_airflow: 'Depressurizing',
			depressurize_end: 'Depressurization complete',
			vacuum: 'Vacuum',
			error: 'Error',
		},
		audio: {
			// TODO
		}
	},
});

blobs.push({
	type: 'box',
	id: 'airlock_main',
	status: 'open',
	pressure: 1.0,

	transition_status: null,
	countdown_to: 0,
	malfunction: false,

	config: {
		// transition time delays (milliseconds)
		pressurize: {
			start_delay: 2000,
			duration: 25000,
			end_delay: 10000,  // FIXME: how long does the door take to open?
			malfunction_delay: 2000,
		},
		depressurize: {
			start_delay: 10000,
			duration: 600000,  // 10 minutes(!)
			end_delay: 2000,
		},
		dmx: {
			airlock_open: 'MainAirlockOpen',
			airlock_close: 'MainAirlockClose',
		},
		status_messages: {
			pressurize_start: 'Pressurizing',
			pressurize_airflow: 'Pressurizing',
			pressurize_end: 'Opening door',
			open: 'Door open',
			malfunction: 'Door malfunction',
			depressurize_start: 'Closing door',
			depressurize_airflow: 'Depressurizing',
			depressurize_end: 'Depressurization complete',
			vacuum: 'Vacuum',
			error: 'Error',
		},
		audio: {
			// TODO
		}
	},
});

export default blobs;
