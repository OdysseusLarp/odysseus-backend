import { saveBlob, clamp, interval } from '../helpers';
import store, { watch } from '../../store/store';
import { getEmptyEpsilonClient } from '../../emptyepsilon';
import { updateEmptyEpsilonState } from '../../index';
import { logger } from '../../logger';
import { isFinite } from 'lodash';

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

function getEEHealth(ee, type) {
	if (type === 'hull') {
		return ee.general.shipHullPercent;
	} else {
		const typeHealth = `${type}Health`;
		return ee.systems.health[typeHealth];
	}
}

async function setEEHealth(type, health) {
	if (type === 'hull') {
		await getEmptyEpsilonClient().setHullHealthPercent(health);
		await updateEmptyEpsilonState();
	} else {
		await getEmptyEpsilonClient().setGameState('setSystemHealth', type, health);
		await updateEmptyEpsilonState();
	}
}

function breakTask(task) {
	let toBeBroken;
	logger.info(`Breaking task ${task.id} of EE type ${task.eeType}`);
	for (const type of ['game', 'box']) {
		if (task[type]) {
			toBeBroken = store.getState().data[type][task[type]];
			break;
		}
	}
	if (!toBeBroken) {
		logger.error(`Could not find game/box from task ${JSON.stringify(task)}`);
		return;
	}
	saveBlob({
		...toBeBroken,
		status: 'broken'
	});
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
	const unbrokenTasks = tasks.filter(notBroken);
	const originalHealth = clamp(computeHealth(brokenTasks), -1, 1);
	let currentHealth = originalHealth;

	while (currentHealth > targetHealth && unbrokenTasks.length > 0) {
		const index = Math.floor(Math.random() * unbrokenTasks.length);
		const toBeBroken = unbrokenTasks.splice(index, 1)[0];
		breakTask(toBeBroken);
		currentHealth -= toBeBroken.eeHealth;
	}
	if (currentHealth > targetHealth) {
		logger.error(`There were not enough EE tasks of type ${type} to break! `+
		  `currentHealth=${currentHealth} targetHealth=${targetHealth}`);
	}
	logger.info(`Task-based EE ${type} health changed from ${originalHealth} to ${currentHealth}`);
}

// Rules for breaking tasks when EE health decreases
watch(['data', 'ship', 'ee'], (ee, previous, state) => {
	for (const type of TYPES) {
		const previousHealth = getEEHealth(previous, type);
		const nowHealth = getEEHealth(ee, type);
		if (nowHealth < previousHealth) {
			logger.info(`Detected EE ${type} health drop from ${previousHealth} `+
			  `to ${nowHealth}`);
			breakTasks(type, nowHealth);
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
		const taskHealth = computeHealth(brokenTasks);

		const ee = store.getState().data.ship.ee;
		const eeHealth = getEEHealth(ee, type);

		//  eeHealth - 10% - epsilon <= taskHealth <= eeHealth + epsilon
		const epsilon = 0.001;
		if (!(eeHealth - 0.1 - epsilon <= taskHealth && taskHealth <= eeHealth + epsilon)) {
			logger.error(`EE ${type} health has significant mismatch between EE and task-based status: `+
			  `EE shows ${eeHealth} and tasks show ${taskHealth}`);
		}
	}
}, 60000);
