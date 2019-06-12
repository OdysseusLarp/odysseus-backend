import { logger } from './logger';
import DMX from 'dmx';


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

	BridgePowerSocketOn: 120,
	BridgePowerSocketOff: 121,
	EngineeringPowerSocketOn: 122,
	EngineeringPowerSocketOff: 123,
	MedbayPowerSocketOn: 124,
	MedbayPowerSocketOff: 125,
	SciencePowerSocketOn: 126,
	SciencePowerSocketOff: 127,
	LoungePowerSocketOn: 128,
	LoungePowerSocketOff: 129,
};

const dmx = init();

function init() {
	if (process.env.DMX_DRIVER) {
		const dmx = new DMX();
		dmx.addUniverse(UNIVERSE_NAME, process.env.DMX_DRIVER);
		return dmx;
	} else {
		return {
			update() {}
		};
	}
}

export function setValue(channel, value) {
	logger.debug(`Setting DMX channel ${channel} (${findChannelName(channel)}) to ${value}`);
	dmx.update(UNIVERSE_NAME, { channel: value });
}

export function fireEvent(channel, value = 255) {
	logger.debug(`Firing event on DMX channel ${channel} (${findChannelName(channel)}) value ${value}`);
	dmx.update(UNIVERSE_NAME, { channel: value });
	setTimeout(() => dmx.update(UNIVERSE_NAME, { channel: 0 }), EVENT_DURATION);
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
