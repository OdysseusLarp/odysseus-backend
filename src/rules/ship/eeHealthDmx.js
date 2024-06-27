import { interval } from '../helpers';
import store, { watch } from '../../store/store';
import { fireEvent, CHANNELS, mapDmxValue, setDmxValue } from '../../dmx';
import { logger } from '@/logger';

const GENERAL_HEALTH_TYPES = [
	'reactor',
	'impulse',
	'maneuver',
	'hull', // special case
	'lifesupport', // special case
];

const ALL_REPORTED_HEALTH_TYPES = {
	// Base EE health values are in range -1 .. 1
	// jumpdrive + warp are unused and thus missing
	frontshield: {
		disabled: CHANNELS.FrontShieldDisabled,
		critical: CHANNELS.FrontShieldCritical,
		damaged: CHANNELS.FrontShieldDamaged,
		normal: CHANNELS.FrontShieldNormal,
		value: CHANNELS.FrontShieldValue,
	},
	rearshield: {
		disabled: CHANNELS.RearShieldDisabled,
		critical: CHANNELS.RearShieldCritical,
		damaged: CHANNELS.RearShieldDamaged,
		normal: CHANNELS.RearShieldNormal,
		value: CHANNELS.RearShieldValue,
	},
	impulse: {
		disabled: CHANNELS.ImpulseDisabled,
		critical: CHANNELS.ImpulseCritical,
		damaged: CHANNELS.ImpulseDamaged,
		normal: CHANNELS.ImpulseNormal,
		value: CHANNELS.ImpulseValue,
	},
	missilesystem: {
		disabled: CHANNELS.MissileSystemDisabled,
		critical: CHANNELS.MissileSystemCritical,
		damaged: CHANNELS.MissileSystemDamaged,
		normal: CHANNELS.MissileSystemNormal,
		value: CHANNELS.MissileSystemValue,
	},
	reactor: {
		disabled: CHANNELS.ReactorDisabled,
		critical: CHANNELS.ReactorCritical,
		damaged: CHANNELS.ReactorDamaged,
		normal: CHANNELS.ReactorNormal,
		value: CHANNELS.ReactorValue,
	},
	maneuver: {
		disabled: CHANNELS.ManeuverDisabled,
		critical: CHANNELS.ManeuverCritical,
		damaged: CHANNELS.ManeuverDamaged,
		normal: CHANNELS.ManeuverNormal,
		value: CHANNELS.ManeuverValue,
	},
	beamweapons: {
		disabled: CHANNELS.BeamWeaponsDisabled,
		critical: CHANNELS.BeamWeaponsCritical,
		damaged: CHANNELS.BeamWeaponsDamaged,
		normal: CHANNELS.BeamWeaponsNormal,
		value: CHANNELS.BeamWeaponsValue,
	},
	// Hull is between 0 .. 1
	hull: {
		disabled: CHANNELS.HullDisabled,
		critical: CHANNELS.HullCritical,
		damaged: CHANNELS.HullDamaged,
		normal: CHANNELS.HullNormal,
		value: CHANNELS.HullValue,
		min: 0,
		max: 1,
	},
	// 'general' is average of a few main types
	general: {
		disabled: CHANNELS.GeneralStatusDisabled,
		critical: CHANNELS.GeneralStatusCritical,
		damaged: CHANNELS.GeneralStatusDamaged,
		normal: CHANNELS.GeneralStatusNormal,
		value: CHANNELS.GeneralStatusValue,
	},
	// Life support is reported separatedly in lifesupport.js because it also sends ship log events
};

function getEEHealth(ee, type) {
	if (type === 'hull') {
		return ee.general.shipHullPercent;
	} else if (type === 'lifesupport') {
		return store.getState().data.ship.lifesupport.health;
	} else if (type === 'general') {
		const average =
			GENERAL_HEALTH_TYPES.map(type => getEEHealth(ee, type)).reduce((a, b) => a + b) / GENERAL_HEALTH_TYPES.length;
		return average;
	} else {
		const typeHealth = `${type}Health`;
		return ee.systems.health[typeHealth];
	}
}

/*
 * dmx_limits definition:
 * {
 *    reactor: [0.3, 0.7],  // critical, damaged limits
 *    ...
 * }
 */
function getHealthStatus(type, value) {
	const limits = store.getState().data.ship.dmx_limits;
	if (!limits || !limits[type]) {
		logger.error(`dmx_limits blob not found or no entry for health type ${type}`);
		return 'normal';
	}
	const criticalLimit = limits[type][0];
	const damagedLimit = limits[type][1];
	if (value <= 0) {
		return 'disabled';
	} else if (value <= criticalLimit) {
		return 'critical';
	} else if (value <= damagedLimit) {
		return 'damaged';
	} else {
		return 'normal';
	}
}

const previousHealthStatus = {};
const previousHealthValue = {};

function updateHealthValues() {
	const ee = store.getState().data.ship.ee;
	for (const [type, settings] of Object.entries(ALL_REPORTED_HEALTH_TYPES)) {
		try {
			const value = getEEHealth(ee, type);
			const status = getHealthStatus(type, value);
			const dmxValue = mapDmxValue(value, settings.min ?? -1, settings.max ?? 1);
			if (status !== previousHealthStatus[type]) {
				const channel = settings[status];
				if (channel) {
					fireEvent(channel);
				}
				previousHealthStatus[type] = status;
			}
			if (value !== previousHealthValue[type]) {
				setDmxValue(settings.value, dmxValue);
				previousHealthValue[type] = value;
			}
		} catch (err) {
			logger.error(`Error updating health values for ${type}`, err);
			continue;
		}
	}
}

watch(['data', 'ship', 'ee'], updateHealthValues);
watch(['data', 'ship', 'lifesupport'], updateHealthValues);
interval(updateHealthValues, 30000); // in case something is missed
