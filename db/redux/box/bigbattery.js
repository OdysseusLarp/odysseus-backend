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
	brightness: 20,
	// In what time is the battery depleted from 100% to 0%, minutes (configuration)
	depletion_time_mins: 3 * 60 + 15,
});

export default blobs;
