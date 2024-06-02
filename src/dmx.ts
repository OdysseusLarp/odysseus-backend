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

	// Health statuses
	FrontShieldNormal: 200,
	FrontShieldDamaged: 201,
	FrontShieldCritical: 202,
	FrontShieldDisabled: 203,
	FrontShieldValue: 204,
	RearShieldNormal: 205,
	RearShieldDamaged: 206,
	RearShieldCritical: 207,
	RearShieldDisabled: 208,
	RearShieldValue: 209,
	ImpulseNormal: 210,
	ImpulseDamaged: 211,
	ImpulseCritical: 212,
	ImpulseDisabled: 213,
	ImpulseValue: 214,
	MissileSystemNormal: 215,
	MissileSystemDamaged: 216,
	MissileSystemCritical: 217,
	MissileSystemDisabled: 218,
	MissileSystemValue: 219,
	ReactorNormal: 220,
	ReactorDamaged: 221,
	ReactorCritical: 222,
	ReactorDisabled: 223,
	ReactorValue: 224,
	ManeuverNormal: 225,
	ManeuverDamaged: 226,
	ManeuverCritical: 227,
	ManeuverDisabled: 228,
	ManeuverValue: 229,
	BeamWeaponsNormal: 230,
	BeamWeaponsDamaged: 231,
	BeamWeaponsCritical: 232,
	BeamWeaponsDisabled: 233,
	BeamWeaponsValue: 234,
	HullNormal: 235,
	HullDamaged: 236,
	HullCritical: 237,
	HullDisabled: 238,
	HullValue: 239,

	LifeSupportNormal: 240,
	LifeSupportDamaged: 241,
	LifeSupportCritical: 242,
	// Life support does not use 'disabled' signal
	// LifeSupportDisabled: 243,
	LifeSupportValue: 244,

	GeneralStatusNormal: 245,
	GeneralStatusDamaged: 246,
	GeneralStatusCritical: 247,
	GeneralStatusDisabled: 248,
	GeneralStatusValue: 249,

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
				logger.debug(`Mock DMX update on universe ${universe}: ${JSON.stringify(value)}`);
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

export function mapDmxValue(value: number, inMin: number, inMax: number): number {
	const outMin = 0;
	const outMax = 255;
	const outValue = Math.round(outMin + ((outMax - outMin) * (value - inMin)) / (inMax - inMin));
	return Math.min(Math.max(outValue, outMin), outMax);
}

export function setDmxValue(channel: Channel, value: number) {
	if (!isNumber(channel) || !isNumber(value) || channel < 0 || channel > 255 || value < 0 || value > 255) {
		logger.error(`Attempted DMX setDmxValue with invalid channel=${channel} or value=${value}`);
		return;
	}
	logger.debug(`Setting DMX channel ${channel} (${findChannelName(channel)}) value ${value}`);
	dmx.update(UNIVERSE_NAME, { [channel]: value });
}
