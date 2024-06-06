/*
 * Big battery location values. These are physically wired into the sockets.
 */
export enum BigBatteryLocation {
	NONE = 0,
	ENGINEERING = 1,
	MEDBAY = 2,
	SCIENCE = 3,
	FIGHTER1 = 4,
	FIGHTER2 = 5,
	FIGHTER3 = 6,
}

export interface BigBattery {
	// Current capacity in percent 0-100 (set by backend)
	capacity_percent: number;
	// Position where connected (set by box)
	connected_position: BigBatteryLocation;
	// Whether box is currently actively used (set by backend), affects tube glowing
	active: boolean;
	// Brightness of Neopixel LEDs 1-255 (configuration)
	brightness: number;
	// In what time is the battery depleted from 100% to 0%, minutes (configuration)
	depletion_time_mins: number;
}

/**
 * Check whether big battery is connected to the specified location and has charge remaining.
 */
export function isBatteryConnectedAndCharged(battery: BigBattery | undefined, location: BigBatteryLocation) {
	return battery?.connected_position === location && battery?.capacity_percent > 0;
}

/**
 * Check whether big battery is connected to the specified location (regardless whether charged).
 */
export function isBatteryConnected(battery: BigBattery | undefined, location: BigBatteryLocation) {
	return battery?.connected_position === location;
}
