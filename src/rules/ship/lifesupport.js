import { saveBlob, interval, clamp } from '../helpers';
import store, { watch } from '../../store/store';
import { CHANNELS, fireEvent, mapDmxValue, setDmxValue } from '../../dmx';
import { logger } from '../../logger';
import { shipLogger } from '../../models/log';
import { getEmptyEpsilonClient } from '../../integrations/emptyepsilon/client';

// Delay DMX signal + ship log by 4.5 minutes for CO2 / Oxygen levels to change resulting from breakage
const LEVEL_NOTIFICATION_DELAY = 4.5 * 60 * 1000;

// Life support is hard-coded to correspond to fuse boxes fuses + life support tasks

function updateLifeSupport() {
	const fuseHealth = countFuseHealth();
	const tasksBroken = countTaskHealthReduction();
	const health = clamp(fuseHealth - tasksBroken, -1, 1);

	if (!store.getState().data.ship.lifesupport || store.getState().data.ship.lifesupport.health !== health) {
		logger.info(`Setting lifesupport health to ${health}`);
		saveBlob({
			type: 'ship',
			id: 'lifesupport',
			health,
			fuseHealth,
			tasksBroken,
		});
		setDmxValue(CHANNELS.LifeSupportValue, mapDmxValue(health, -1, 1));
		setTimeout(checkLevel, LEVEL_NOTIFICATION_DELAY);
	}
}

/** Return fuse health 0 .. 1 */
function countFuseHealth() {
	const boxes = store.getState().data.box;
	let total = 0;
	let unbroken = 0;
	for (const box of Object.values(boxes)) {
		if (box.fuses) {
			total += box.fuses.length;
			unbroken += box.fuses.reduce((count, fuse) => count + (fuse ? 1 : 0));
		}
	}
	const health = unbroken / total;
	return health;
}

/** Return percentage of lifesupportHealth that is broken in tasks, 0 .. 1 */
function countTaskHealthReduction() {
	const tasks = store.getState().data.task;
	let reduction = 0;
	for (const task of Object.values(tasks)) {
		if (task.lifesupportHealth && isBroken(task)) {
			reduction += task.lifesupportHealth;
		}
	}
	return reduction;
}

function isBroken(task) {
	return task.status === 'broken' || task.status === 'calibrating';
}

const NORMAL = 1;
const DAMAGED = 2;
const CRITICAL = 3;

let oldLevel = NORMAL;
function checkLevel() {
	const currentLevel = getLevel(store.getState().data.ship.lifesupport.health);
	if (oldLevel !== currentLevel) {
		switch (currentLevel) {
			case NORMAL:
				fireEvent(CHANNELS.LifeSupportNormal);
				shipLogger.info(`Life support back to normal.`, { showPopup: true });
				break;
			case DAMAGED:
				fireEvent(CHANNELS.LifeSupportDamaged);
				shipLogger.warning(`Life support level degraded. CO2 levels elevated.`, { showPopup: true });
				break;
			case CRITICAL:
				fireEvent(CHANNELS.LifeSupportCritical);
				shipLogger.warning(`Life support level critical. Oxygen level low.`, { showPopup: true });
				getEmptyEpsilonClient().setAlertLevel('red');
				break;
			// DISABLED state is not used for life support
		}
		oldLevel = currentLevel;
	}
}

function getLevel(health) {
	const limits = store.getState().data.ship.dmx_limits;
	if (!limits || !limits.lifesupport) {
		logger.error(`dmx_limits blob not found or no entry for health type lifesupport`);
		return NORMAL;
	}
	const criticalLimit = limits.lifesupport[0];
	const damagedLimit = limits.lifesupport[1];
	if (health <= criticalLimit) {
		return CRITICAL;
	} else if (health <= damagedLimit) {
		return DAMAGED;
	} else {
		return NORMAL;
	}
}

watch(['data', 'box'], updateLifeSupport);
watch(['data', 'task'], updateLifeSupport);
interval(updateLifeSupport, 30000);
