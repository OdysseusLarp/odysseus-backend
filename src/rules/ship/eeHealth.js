import { saveBlob, clamp, interval } from '../helpers';
import store, { watch } from '../../store/store';
import { getEmptyEpsilonClient } from '../../emptyepsilon';
import { logger } from '../../logger';

/*
 * Rules binding to EE health states.
 */

const TYPES = ['reactor'];


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
	return Object.values(store.getState().data.task).filter(task => task.eeType === type);
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
		const typeHealth = `${type}Health`;
		logger.info(`Check ${typeHealth} now=${ee.systems.health[typeHealth]} previous=${previous.systems.health[typeHealth]}`);
		if (ee.systems.health[typeHealth] < previous.systems.health[typeHealth]) {
			logger.info(`Detected EE ${type} health drop from ${previous.systems.health[typeHealth]} `+
			  `to ${ee.systems.health[typeHealth]}`);
			breakTasks(type, ee.systems.health[typeHealth]);
		}
	}
});

// Rules for increasing EE health when tasks are fixed
watch(['data', 'task'], (tasks, previousTasks, state) => {
	for (const id of Object.keys(tasks)) {
		const task = tasks[id];
		const previous = previousTasks[id];
		if (task.eeType && task.eeHealth && task.status === 'fixed' && previous.status !== 'fixed') {
			const ee = store.getState().data.ship.ee;
			const type = task.eeType;
			const typeHealth = `${type}Health`;
			const health = clamp(ee.systems.health[typeHealth] + task.eeHealth, -1, 1);
			logger.info(`Detected EE ${type} health task ${task.id} fixed, increasing health by `+
			  `${task.eeHealth} to ${health}`);
			if (health) {
				getEmptyEpsilonClient().setGameState('setSystemHealth', type, health);
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
		const typeHealth = `${type}Health`;
		const eeHealth = ee.systems.health[typeHealth];

		//  eeHealth - 10% - epsilon <= taskHealth <= eeHealth + epsilon
		const epsilon = 0.001;
		if (!(eeHealth - 0.1 - epsilon <= taskHealth && taskHealth <= eeHealth + epsilon)) {
			logger.error(`EE ${type} health has significant mismatch between EE and task-based status: `+
			  `EE shows ${eeHealth} and tasks show ${taskHealth}`);
		}
	}
}, 60000);
