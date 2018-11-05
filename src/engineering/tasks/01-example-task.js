import BaseTask from './base-task';
import { getBoxValueById } from '../../models/box';
import { getEmptyEpsilonClient } from '../../emptyepsilon';
import { gameState } from '../..';
import { logger } from '../../logger';
import { get } from 'lodash';

export default class ExampleTask extends BaseTask {
	constructor(props) {
		super(props);
		// Tick validation of this task every 5 seconds
		this.validationInterval = setInterval(this.validate, 5000);
	}

	// Do cleanup here, like clearing intervals and updating model if needed
	async cleanup() {
		clearInterval(this.validationInterval);
	}

	// Will be called whenever a value of any box is changed
	async onBoxValueChange(boxId) {
		if (boxId === 1 || boxId === 2) return this.validate();
	}

	// Every task needs a validate function
	async validate() {
		// TODO: Might want to use concurrency at some point
		const val1 = get(await getBoxValueById(1), 'value');
		const val2 = get(await getBoxValueById(2), 'value');
		const rearshieldHealth = get(gameState, 'systems.health.rearshieldHealth');
		if (val1 > 500 && val2 > 500 && rearshieldHealth < 1) {
			getEmptyEpsilonClient().setGameState('setSystemHealth', 'rearshield', 1)
				.catch(logger.error);
		} else if (val1 < 100 && val2 < 100 && rearshieldHealth > 0.2) {
			getEmptyEpsilonClient().setGameState('setSystemHealth', 'rearshield', 0.2)
				.catch(logger.error);
		}
	}
}
