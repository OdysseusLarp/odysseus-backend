import { clamp, interval, chooseRandom, getPriorityTasks } from '../helpers';
import { breakTask } from '../breakTask';
import store, { watch } from '../../store/store';
import { getEmptyEpsilonClient } from '../../integrations/emptyepsilon/client';
import { updateEmptyEpsilonState } from '../../integrations/emptyepsilon/state';
import { logger } from '../../logger';
import { isFinite, isEqual } from 'lodash';

/*
 * Rules binding to EE health states.
 */

const TYPES = [
	'reactor',
	'impulse',
	'maneuver',
	'frontshield',
	'rearshield',
	'missilesystem',
	'beamweapons',
	'hull',  // special case
];

const EPSILON = 0.0001;
const MIN_DESIRED_HULL_HEALTH = 2;

function getEEHealth(ee, type) {
	if (type === 'hull') {
		return ee.general.shipHullPercent;
	} else {
		const typeHealth = `${type}Health`;
		return ee.systems.health[typeHealth];
	}
}

async function setEEHealth(type, health) {
	try {
		if (type === 'hull') {
			await getEmptyEpsilonClient().setHullHealthPercent(health);
			await updateEmptyEpsilonState();
		} else {
			await getEmptyEpsilonClient().setGameState('setSystemHealth', type, health);
			await updateEmptyEpsilonState();
		}
	} catch (err) {
		logger.error('Could not set EE health', err);
	}
}


function getEETasks(type) {
	return Object.values(store.getState().data.task).filter(task => task.eeType === type && !task.used);
}

const isBroken = task => task.status === 'broken' || task.status === 'calibrating';
const notBroken = task => !isBroken(task);

function computeHealth(brokenTasks) {
	return brokenTasks.reduce((health, task) => health - task.eeHealth, 1);
}

function breakTasks(type, targetHealth) {
	const tasks = getEETasks(type);
	const brokenTasks = tasks.filter(isBroken);
	let unbrokenTasks = tasks.filter(notBroken);
	const originalHealth = clamp(computeHealth(brokenTasks), -1, 1);
	let currentHealth = originalHealth;

	while (currentHealth - EPSILON > targetHealth && unbrokenTasks.length > 0) {
		const priorityTasks = getPriorityTasks(unbrokenTasks);
		const toBeBroken = chooseRandom(priorityTasks)[0];
		if (!toBeBroken) {
			logger.error(`toBeBroken is undefined even though unbrokenTasks.length=${unbrokenTasks.length},
			unbrokenTasks=${JSON.stringify(unbrokenTasks)}`);
			break;
		}
		unbrokenTasks = unbrokenTasks.filter(task => !isEqual(task, toBeBroken));
		breakTask(toBeBroken);
		currentHealth -= toBeBroken.eeHealth;
	}
	if (currentHealth - EPSILON > targetHealth) {
		logger.error(`There were not enough EE tasks of type ${type} to break! `+
		  `currentHealth=${currentHealth} targetHealth=${targetHealth}`);
	}
	logger.info(`Task-based EE ${type} health changed from ${originalHealth} to ${currentHealth}`);
}

function isHullCompletelyBroken(ee) {
	if (typeof ee?.general?.shipHull !== 'number') {
		return true;
	}
	return ee.general.shipHull <= MIN_DESIRED_HULL_HEALTH;
}

// Rules for breaking tasks when EE health decreases
watch(['data', 'ship', 'ee'], (ee, previous, state) => {
	for (const type of TYPES) {
		try {
			const previousHealth = getEEHealth(previous, type);
			const nowHealth = getEEHealth(ee, type);

			// We should not break any hull tasks when its health fluctuates between 0 and 1,
			// as we automatically always patch it to 2 when it drops below it in order to get
			// DMX from EE for all hits
			const isHullBroken = isHullCompletelyBroken(ee);
			const wasHullBroken = isHullCompletelyBroken(previous);
			const shouldIgnoreHullDamage = isHullBroken && wasHullBroken;
			if (type === 'hull' && shouldIgnoreHullDamage) {
				logger.info('Hull is completely broken, not breaking any more tasks');
				return;
			}

			if (nowHealth < previousHealth) {
				logger.info(`Detected EE ${type} health drop from ${previousHealth} `+
					`to ${nowHealth}`);
				breakTasks(type, nowHealth);
			}
		} catch (err) {
			logger.warn(`Could not break tasks for EE ${type} health:`, err, previous);
		}
	}
});

// Rules for increasing EE health when tasks are fixed
watch(['data', 'task'], async (tasks, previousTasks, state) => {
	for (const id of Object.keys(tasks)) {
		const task = tasks[id];
		const previous = previousTasks[id];
		if (task.eeType && task.eeHealth && task.status === 'fixed' && previous.status !== 'fixed') {
			const ee = store.getState().data.ship.ee;
			const type = task.eeType;
			const health = clamp(getEEHealth(ee, type) + task.eeHealth, -1, 1);
			logger.info(`Detected EE ${type} health task ${task.id} fixed, increasing health by `+
			  `${task.eeHealth} to ${health}`);
			if (isFinite(health)) {
				await setEEHealth(type, health);
			} else {
				logger.error(`Attempted to set EE ${type} health to ${health} (after fixing something)`);
			}
		}
	}
});


// Sanify-check that EE health and task-based health are sufficiently close to one another
interval(() => {
	for (const type of TYPES) {
		const tasks = getEETasks(type);
		const brokenTasks = tasks.filter(isBroken);
		const maxHealthTask = brokenTasks.reduce((max, task) => Math.max(max, task.eeHealth ? task.eeHealth : 0), 0);
		const taskHealth = computeHealth(brokenTasks);

		const ee = store.getState().data.ship.ee;
		const eeHealth = getEEHealth(ee, type);

		//  eeHealth - maxHealthTask - epsilon <= taskHealth <= eeHealth + epsilon
		if (!(eeHealth - maxHealthTask - EPSILON <= taskHealth && taskHealth <= eeHealth + EPSILON)) {
			logger.error(`EE ${type} health has significant mismatch between EE and task-based status: `+
			  `EE shows ${eeHealth} and tasks show ${taskHealth.toFixed(2)}`);
		}
	}
}, 60000);
