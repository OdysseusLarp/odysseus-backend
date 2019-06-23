import { interval } from '../helpers';
import store, { watch } from '../../store/store';
import { fireEvent, CHANNELS } from '../../dmx';


const GENERAL_HEALTH_TYPES = [
	'reactor',
	'impulse',
	'maneuver',
	'hull',  // special case
	'lifesupport', // special case
];

function getEEHealth(ee, type) {
	if (type === 'hull') {
		return ee.general.shipHullPercent;
	} else if (type === 'lifesupport') {
		return store.getState().data.ship.lifesupport.health;
	} else {
		const typeHealth = `${type}Health`;
		return ee.systems.health[typeHealth];
	}
}

const NORMAL = 1;
const CRITICAL = 2;
const OFF = 3;

let reactorHealthStatus = NORMAL;
function updateReactorHealth() {
	const status = getReactorStatus();
	if (reactorHealthStatus !== status) {
		switch (status) {
			case NORMAL:
				fireEvent(CHANNELS.ReactorNormal);
				break;
			case CRITICAL:
				fireEvent(CHANNELS.ReactorCritical);
				break;
			case OFF:
				fireEvent(CHANNELS.ReactorOff);
				break;
		}
		reactorHealthStatus = status;
	}
}

function getReactorStatus() {
	const ee = store.getState().data.ship.ee;
	const health = getEEHealth(ee, 'reactor');
	if (health <= 0) {
		return OFF;
	} else if (health <= 0.45) {
		return CRITICAL;
	} else {
		return NORMAL;
	}
}



// General health status DMX signals

let generalStatusBroken = false;
function updateGeneralHealth() {
	// condition: average of (hull, reactor, impulse, life support, maneuver) < 40%
	const ee = store.getState().data.ship.ee;
	const average = GENERAL_HEALTH_TYPES.map(type => getEEHealth(ee, type)).reduce((a, b) => a+b) / GENERAL_HEALTH_TYPES.length;
	if (average < 0.4) {
		if (!generalStatusBroken) {
			fireEvent(CHANNELS.GeneralStatusBroken);
			generalStatusBroken = true;
		}
	} else {
		if (generalStatusBroken) {
			fireEvent(CHANNELS.GeneralStatusNormal);
			generalStatusBroken = false;
		}
	}
}


watch(['data', 'ship', 'ee'], updateGeneralHealth);
watch(['data', 'ship', 'lifesupport'], updateGeneralHealth);
interval(updateGeneralHealth, 10000);

watch(['data', 'ship', 'ee'], updateReactorHealth);
interval(updateReactorHealth, 10000);
