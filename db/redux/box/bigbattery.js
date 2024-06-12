const blobs = [];

blobs.push({
	type: 'box',
	id: 'bigbattery',
	status: 'initial',

	// Current capacity in percent (set by backend)
	capacity_percent: 100,
	// Position where connected (set by box)
	connected_position: 0,
	// Whether box is currently actively used (set by backend), affects tube glowing
	active: false,
	// Brightness of Neopixel LEDs 1-255 (configuration)
	brightness: 10,
	// In what time is the battery depleted from 100% to 0%, minutes (configuration)
	depletion_time_mins: 3 * 60 + 15,
	// Set to integer values of locations where device is always assumed to be connected + charged.
	// For disaster situations where the real device no longer works.
	emergency_assumed_at_positions: [],

	presets: {
		set_full_capacity: {
			capacity_percent: 100,
		},
		assume_battery_everywhere: {
			emergency_assumed_at_positions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
		},
		assume_battery_nowhere: {
			emergency_assumed_at_positions: [],
		},
	},
});

export default blobs;
