import { Router } from 'express';
import { getEmptyEpsilonClient } from '@/integrations/emptyepsilon/client';
import { handleAsyncErrors } from './helpers';
import { logger } from '@/logger';
import httpErrors from 'http-errors';

/**
 * @typedef EmptyEpsilonCommand
 * @property {object} command.required - Command - eg: setSystemHealth,setSystemHeat,setWeaponStorage,setAlertLevel
 * @property {object} target - Target (not needed for setAlertLevel) - eg: reactor,beamweapons,missilesystem,maneuver,impulse,warp,jumpdrive,frontshield,rearshield,homing,nuke,mine,emp,hvli
 * @property {object} value.required - Value, integer for weapon counts, float for health/heat (0.5 == 50%), normal/yellow/red for alert level - eg: 1
 */

/**
 * Send a command to EmptyEpsilon to mutate game state
 * @route PUT /state
 * @group EmptyEpsilon - EmptyEpsilon integration
 * @consumes application/json
 * @produces application/json
 * @param {EmptyEpsilonCommand.model} command.body
 * @returns {object} 204 - Empty response
 */
export const setStateRouteHandler = handleAsyncErrors((req, res) => {
	const { command, target, value } = req.body;
	const client = getEmptyEpsilonClient();
	if (command === 'setAlertLevel') {
		client
			.setAlertLevel(value)
			.then(() => {
				res.sendStatus(204);
				(req as any).io.emit('shipAlertLevelUpdated', value);
			})
			.catch(error => {
				logger.error('Error setting alert level to Empty Epsilon', error);
				res.sendStatus(500);
			});
	} else if (command === 'setHull') {
		client
			.setHullHealthPercent(value)
			.then(() => res.sendStatus(204))
			.catch(err => res.sendStatus(500));
	} else {
		client
			.setGameState(command, target, value)
			.then(() => res.sendStatus(204))
			.catch(error => {
				logger.error('Error setting game state', error);
				res.sendStatus(500);
			});
	}
});

/**
 * Get damage DMX status
 * @route GET /emptyepsilon/damage-dmx
 * @group EmptyEpsilon - EmptyEpsilon integration
 * @produces application/json
 * @returns {object} 200 - Success response
 */
export const getDamageDmxRouteHandler = handleAsyncErrors(async (req, res) => {
	const client = getEmptyEpsilonClient();
	const damageDmxEnabled = await client.isDamageDmxEnabled();
	res.json({ damageDmxEnabled });
});

/**
 * @typedef DamageDmxCommand
 * @property {boolean} enableDamageDmx.required - Enable or disable damage DMX - eg: true
 */

/**
 * Enable or disable damage DMX
 * @route POST /emptyepsilon/damage-dmx
 * @group EmptyEpsilon - EmptyEpsilon integration
 * @consumes application/json
 * @produces application/json
 * @param {DamageDmxCommand.model} enableDamageDmx.body
 * @returns {object} 200 - Success response
 */
export const damageDmxRouteHandler = handleAsyncErrors(async (req, res) => {
	const { enableDamageDmx } = req.body;
	if (typeof enableDamageDmx !== 'boolean') {
		throw new httpErrors.BadRequest('enableDamageDmx must be a boolean');
	}

	const client = getEmptyEpsilonClient();
	if (enableDamageDmx) {
		await client.enableDamageDmx();
	} else {
		await client.disableDamageDmx();
	}
	res.json({ enableDamageDmx });
});

const emptyEpsilonRouter = Router();
emptyEpsilonRouter.post('/emptyepsilon/damage-dmx', damageDmxRouteHandler);
emptyEpsilonRouter.get('/emptyepsilon/damage-dmx', getDamageDmxRouteHandler);

export { emptyEpsilonRouter };
