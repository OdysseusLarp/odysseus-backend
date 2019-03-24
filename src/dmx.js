import { logger } from './logger';

// const UNIVERSE = 2;
export const CHANNELS = {
	JumpPrepReady: 1,
	JumpPrepStart: 2,
	JumpApproved: 3,
	JumpRejected: 4,
	JumpPrepEnd: 5,
	JumpReady: 6,
	JumpInit: 7,
	JumpInitBreaking: 8,
	JumpStart: 9,
	JumpEnd: 10,
	JumpAbort: 11,
};

export function setValue(channel, value) {
	logger.debug(`Setting DMX channel ${channel} (${findChannelName(channel)}) to ${value}`);
}

export function fireEvent(channel) {
	logger.debug(`Firing event on DMX channel ${channel} (${findChannelName(channel)})`);
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
