import { interval, randomInt } from '../helpers';
import store from '../../store/store';
import { logger } from '../../logger';
import { getEmptyEpsilonClient } from '../../emptyepsilon';
import { updateEmptyEpsilonState } from '../../index';


const BREAKAGE = {
	reactor: 0.3,
	impulse: 0.45,
	frontshield: 0.45,
	rearshield: 0.45,
	missilesystem: 0.45,
	beamweapons: 0.45,
};
const MIN_HEALTH = 0.10;


async function setEEHealth(type, health) {
	try {
		await getEmptyEpsilonClient().setGameState('setSystemHealth', type, health);
		await updateEmptyEpsilonState();
	} catch (err) {
		logger.error('Could not set EE health', err);
	}
}


function getEETasks(type) {
	return Object.values(store.getState().data.task).filter(task => task.eeType === type && !task.used);
}
const isBroken = task => task.status === 'broken' || task.status === 'calibrating';

function countBrokenEETasks() {
	return Object.keys(BREAKAGE).map((type) => getEETasks(type).filter(isBroken).length)
		.reduce((a, b) => a+b);
}

function breakEE() {
	const ee = store.getState().data.ship.ee;
	const types = Object.keys(BREAKAGE);
	while (types.length > 0) {
		const index = randomInt(0, types.length-1);
		const type = types.splice(index, 1)[0];
		const health = ee.systems.health[`${type}Health`];
		if (health > MIN_HEALTH + 0.01) {
			logger.info(`Changing EE ${type} health from ${health} to ${health - BREAKAGE[type]}`);
			setEEHealth(type, health - BREAKAGE[type]);
			return;
		}
	}
	logger.error(`Could not find any EE type which was not already maxed out broken: ${JSON.stringify(ee.systems.health)}`);
}


let lastBreak = Date.now();
interval(() => {
	const demo = store.getState().data.misc.demo;
	const broken = countBrokenEETasks();
	const timeSinceBroken = (Date.now() - lastBreak) / 1000;
	if (broken < demo.eeBreakCount1) {
		if (timeSinceBroken > demo.eeBreakTime1) {
			logger.info(`Breaking some EE type (1), broken=${broken} timeSinceBroken=${Math.floor(timeSinceBroken)}`);
			breakEE();
			lastBreak = Date.now();
		}
	} else if (broken < demo.eeBreakCount2) {
		if (timeSinceBroken > demo.eeBreakTime2) {
			logger.info(`Breaking some EE type (2), broken=${broken} timeSinceBroken=${Math.floor(timeSinceBroken)}`);
			breakEE();
			lastBreak = Date.now();
		}
	} else {
		lastBreak = Date.now();
	}
}, 1000);
