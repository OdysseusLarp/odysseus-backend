import { saveBlob } from '../helpers';
import store, { watch } from '../../store/store';
import { CHANNELS, fireEvent } from '../../dmx';
import { logger } from '../../logger';
import { shipLogger } from '../../models/log';
import { getEmptyEpsilonClient } from '../../emptyepsilon';

const LEVEL_NOTIFICATION_DELAY = 4.5*60*1000;

// Life support is hard-coded to correspond to fuse boxes
watch(['data', 'box'], (boxes, previousBoxes, state) => {
	let total = 0;
	let unbroken = 0;
	for (const id of Object.keys(boxes)) {
		const box = boxes[id];
		if (box.fuses) {
			total += box.fuses.length;
			unbroken += box.fuses.reduce((count, fuse) => count + (fuse ? 1 : 0));
		}
	}
	const health = unbroken / total;
	if (!state.data.ship.lifesupport || state.data.ship.lifesupport.health !== health) {
		logger.info(`Setting lifesupport health to ${unbroken}/${total} = ${health}`);
		saveBlob({
			type: 'ship',
			id: 'lifesupport',
			health,
			total,
			unbroken,
		});
		setTimeout(checkLevel, LEVEL_NOTIFICATION_DELAY);
	}
});


const NORMAL = 1;
const LOW = 2;
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
			case LOW:
				fireEvent(CHANNELS.LifeSupportLow);
				shipLogger.warning(`Life support level degraded. CO2 levels elevated.`, { showPopup: true });
				break;
			case CRITICAL:
				fireEvent(CHANNELS.LifeSupportCritical);
				shipLogger.warning(`Life support level critical. Oxygen level low.`, { showPopup: true });
				getEmptyEpsilonClient().setAlertLevel('red');
				break;
		}
		oldLevel = currentLevel;
	}
}

function getLevel(health) {
	if (health >= 0.7) {
		return NORMAL;
	} else if (health >= 0.2) {
		return LOW;
	} else {
		return CRITICAL;
	}
}
