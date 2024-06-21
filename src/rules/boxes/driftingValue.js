import store from '../../store/store';
import { getEmptyEpsilonClient } from '../../integrations/emptyepsilon/client';
import { updateEmptyEpsilonState } from '../../index';
import { CHANNELS, fireEvent } from '../../dmx';
import { logger } from '../../logger';
import { interval } from '../helpers';

let isOutOfRange = false;

interval(async () => {
	const box = store.getState().data.box.drifting_value;
	if (box.value < box.config.safeRangeMin || box.value > box.config.safeRangeMax) {
		// Out-of-range, fire DMX and check whether to reduce engine health
		if (!isOutOfRange) {
			fireEvent(CHANNELS.DriftingValueOutOfRange);
			isOutOfRange = true;
		}

		if (Math.random() < box.engineBreakProb) {
			const ee = store.getState().data.ship.ee;
			const engineHealth = ee.systems.health.impulseHealth;
			if (engineHealth > 0) {
				logger.info(`Dropping impulse engine health by 1% due to drifting value out-of-range (${box.value})`);
				try {
					await getEmptyEpsilonClient().setGameState('setSystemHealth', 'impulse', Math.max(engineHealth - 0.01, 0));
					await updateEmptyEpsilonState();
				} catch (err) {
					logger.error('Error dropping impulse engine health', err);
				}
			}
		}
	} else {
		if (isOutOfRange) {
			fireEvent(CHANNELS.DriftingValueInRange);
			isOutOfRange = false;
		}
	}
}, 1000);
