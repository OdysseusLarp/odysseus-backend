import { logger } from './logger';
import DMX from 'dmx';
import { isNumber } from 'lodash';


const UNIVERSE_NAME = 'backend';
const EVENT_DURATION = 1000;  // ms

export const CHANNELS = {
	JumpFixed: 100,
	JumpPrepReady: 101,
	JumpPrepStart: 102,
	JumpApproved: 103,
	JumpRejected: 104,
	JumpPrepEnd: 105,
	JumpReady: 106,
	JumpInit: 107,
	JumpStart: 108,
	JumpBreaking: 109,
	JumpEnd: 110,
	JumpEndBreaking: 111,
	JumpAbort: 112,

	LifeSupportNormal: 115,
	LifeSupportLow: 116,
	LifeSupportCritical: 117,

	ShipAnnouncement: 119,

	// Used in fuse box configuration
	BridgeFuseBroken: 120,
	BridgeFuseFixed: 121,
	EngineeringFuseBroken: 122,
	EngineeringFuseFixed: 123,
	MedbayFuseBroken: 124,
	MedbayFuseFixed: 125,
	ScienceFuseBroken: 126,
	ScienceFuseFixed: 127,
	LoungeFuseBroken: 128,
	LoungeFuseFixed: 129,

	// Fired manually from admin ui
	BreachEventStarting: 150,
	BreachEventBreach: 151,
	CaptainDisplayOn: 160,
	CaptainDisplayOff: 161,
};

const dmx = init();

function init() {
	if (process.env.DMX_DRIVER) {
		const dmx = new DMX();
		dmx.addUniverse(UNIVERSE_NAME, process.env.DMX_DRIVER, process.env.DMX_DEVICE_PATH);
		return dmx;
	} else {
		return {
			update() {}
		};
	}
}

export function setValue(channel, value) {
	logger.debug(`Setting DMX channel ${channel} (${findChannelName(channel)}) to ${value}`);
	dmx.update(UNIVERSE_NAME, { [channel]: value });
}

export function fireEvent(channel, value = 255) {
	if (!isNumber(channel) || !isNumber(value) || channel < 0 || channel > 255 || value < 0 || value > 255) {
		logger.error(`Attempted DMX fireEvent with invalid channel=${channel} or value=${value}`);
		return;
	}
	logger.debug(`Firing event on DMX channel ${channel} (${findChannelName(channel)}) value ${value}`);
	dmx.update(UNIVERSE_NAME, { [channel]: value });
	setTimeout(() => dmx.update(UNIVERSE_NAME, { [channel]: 0 }), EVENT_DURATION);
}

function findChannelName(channel) {
	for (const name of Object.keys(CHANNELS)) {
		if (CHANNELS[name] === channel) {
			return name;
		}
	}
	logger.error(`Unknown DMX channel ${channel} used`);
	return 'UNKNOWN';
}
