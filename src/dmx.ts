import { logger } from './logger';
import DMX from 'dmx';
import { isNumber } from 'lodash';
import { processDmxSignal } from './tplink/tplink-control';

const UNIVERSE_NAME = 'backend';
const EVENT_DURATION = 1000; // ms

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

	ReactorNormal: 140,
	ReactorCritical: 141,
	ReactorOff: 142,
	GeneralStatusNormal: 143,
	GeneralStatusBroken: 144,
	DriftingValueOutOfRange: 145,
	DriftingValueInRange: 146,

	// Fired manually from admin ui
	BreachEventStarting: 150,
	BreachEventBreach: 151,
	CaptainDisplayOn: 160,
	CaptainDisplayOff: 161,
	GasLeakEvent: 162,
	StartStandingScanner: 163,
	StartTableScanner: 164,
	SmallBreachEventStarting: 165,
	SmallBreachEventBreach: 166,
	BreachEventEnd: 167,

	// Announcements
	AnnouncementDisregardPrevious: 174,
	AnnouncementAutomatedEmergency: 175,
	AnnouncementBraceForShip2ShipCombat: 176,
	AnnouncementUnknownShip: 177,
	AnnouncementEnemyDetected: 178,
	AnnouncementMissilesDetected: 179,
	AnnouncementAnomalyJumpIncoming: 180,
	AnnouncementCommsSignalDetected: 181,
	AnnouncementBridgeSysMalfunction: 182,
	AnnouncementCommandAuthNotRecog: 183,
	AnnouncementWelcomeCapt: 184,
	AnnouncementStartingUp: 185,
	AnnouncementAuthorizationRequired: 186,
	AnnouncementIdentifyyourself: 187,
	AnnouncementScancompl: 188,
	AnnouncementAnalysiscompl: 189,

	// Airlock events
	MainAirlockDoorClose: 190,
	MainAirlockDoorOpen: 191,
	MainAirlockDoorMalfunction: 192,
	MainAirlockPressurize: 193,
	MainAirlockDepressurize: 194,
	HangarBayDoorLock: 195,
	HangarBayDoorUnlock: 196,
	HangarBayDoorMalfunction: 197,
	HangarBayPressurize: 198,
	HangarBayDepressurize: 199,

	LoraBeaconSignalDecrypted: 250,
	LoraJumpCrystalsLow: 251,
	LoraJumpCrystalsDepleted: 252,
	LoraGridScanInitiated: 253,
	LoraGridScanCompleted: 254,
	IncomingJumpWarning: 255,
	FleetShipDestroyed: 256,
	DataHubHackingDetected: 257,
	DataHubNewsApproved: 258,
	DataHubVoteApproved: 259,
} as const;

type Channel = (typeof CHANNELS)[keyof typeof CHANNELS];

interface Dmx {
	update: (universe: string, value: Record<number, number>) => void;
}

const dmx = init();

function init(): Dmx {
	if (process.env.DMX_DRIVER) {
		const dmx = new DMX();
		dmx.addUniverse(UNIVERSE_NAME, process.env.DMX_DRIVER, process.env.DMX_DEVICE_PATH);
		return dmx;
	} else {
		return {
			update: (universe: string, value: Record<number, number>) => {
				logger.debug(`DMX update on universe ${universe}: ${JSON.stringify(value)}`);
			},
		};
	}
}

function findChannelName(channel: Channel) {
	for (const name of Object.keys(CHANNELS)) {
		if (CHANNELS[name] === channel) {
			return name;
		}
	}
	logger.error(`Unknown DMX channel ${channel} used`);
	return 'UNKNOWN';
}

export function fireEvent(channel: Channel, value = 255) {
	if (!isNumber(channel) || !isNumber(value) || channel < 0 || channel > 255 || value < 0 || value > 255) {
		logger.error(`Attempted DMX fireEvent with invalid channel=${channel} or value=${value}`);
		return;
	}
	logger.debug(`Firing event on DMX channel ${channel} (${findChannelName(channel)}) value ${value}`);
	dmx.update(UNIVERSE_NAME, { [channel]: value });
	setTimeout(() => dmx.update(UNIVERSE_NAME, { [channel]: 0 }), EVENT_DURATION);

	// Send TP-link power socker on/off. Intentionally not awaited.
	processDmxSignal(findChannelName(channel));
}
