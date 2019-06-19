require('dotenv').config({ silent: true });
import { logger } from './logger';
import axios from 'axios';
import nock from 'nock';
import { get, set, forIn, pick, isInteger } from 'lodash';
import { handleAsyncErrors } from './helpers';

const { EMPTY_EPSILON_HOST, EMPTY_EPSILON_PORT } = process.env,
	systems = [
		'reactor',
		'beamweapons',
		'missilesystem',
		'maneuver',
		'impulse',
		'warp',
		'jumpdrive',
		'frontshield',
		'rearshield'
	],
	weapons = ['homing', 'nuke', 'mine', 'emp', 'hvli'],
	requestParameters = {
		homingCount: 'getWeaponStorage("homing")',
		nukeCount: 'getWeaponStorage("nuke")',
		mineCount: 'getWeaponStorage("mine")',
		empCount: 'getWeaponStorage("emp")',
		hvliCount: 'getWeaponStorage("hvli")',
		reactorHealth: 'getSystemHealth("reactor")',
		beamweaponsHealth: 'getSystemHealth("beamweapons")',
		missilesystemHealth: 'getSystemHealth("missilesystem")',
		maneuverHealth: 'getSystemHealth("maneuver")',
		impulseHealth: 'getSystemHealth("impulse")',
		warpHealth: 'getSystemHealth("warp")',
		jumpdriveHealth: 'getSystemHealth("jumpdrive")',
		frontshieldHealth: 'getSystemHealth("frontshield")',
		rearshieldHealth: 'getSystemHealth("rearshield")',
		reactorHeat: 'getSystemHeat("reactor")',
		beamweaponsHeat: 'getSystemHeat("beamweapons")',
		missilesystemHeat: 'getSystemHeat("missilesystem")',
		maneuverHeat: 'getSystemHeat("maneuver")',
		impulseHeat: 'getSystemHeat("impulse")',
		warpHeat: 'getSystemHeat("warp")',
		jumpdriveHeat: 'getSystemHeat("jumpdrive")',
		frontshieldHeat: 'getSystemHeat("frontshield")',
		rearshieldHeat: 'getSystemHeat("rearshield")',
		// energy, hull and shield max values depend on ship settings in EE
		shipEnergy: 'getEnergy()',
		shipHull: 'getHull()',
		shipHullMax: 'getHullMax()',
		shipFrontShield: 'getFrontShield()',
		shipRearShield: 'getRearShield()',
		alertLevel: 'getAlertLevel()'
	};

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
		client.setAlertLevel(value).then(() => {
			res.sendStatus(204);
			req.io.emit('shipAlertLevelUpdated', value);
		}).catch(error => {
			logger.error('Error setting alert level to Empty Epsilon', error);
			res.sendStatus(500);
		});
	} else if (command === 'setHull') {
		client.setHullHealthPercent(value)
			.then(() => res.sendStatus(204))
			.catch(err => res.sendStatus(500));
	} else {
		client.setGameState(command, target, value)
			.then(() => res.sendStatus(204))
			.catch(error => {
				logger.error('Error setting game state', error);
				res.sendStatus(500);
			});
	}
});

function fullStateToCommands(state) {
	const { heat, health } = state.systems;
	const { weapons } = state;
	const commands = [];
	forIn(heat, (value, key) => commands.push({
		command: 'setSystemHeat',
		target: key.replace(/Heat$/, ''),
		value
	}));
	forIn(health, (value, key) => commands.push({
		command: 'setSystemHealth',
		target: key.replace(/Health$/, ''),
		value
	}));
	forIn(weapons, (value, key) => commands.push({
		command: 'setWeaponStorage',
		target: key.replace(/Count$/, ''),
		value
	}));
	return commands;
}

const alertStates = new Map([
	['Normal', 'normal'],
	['YELLOW ALERT', 'yellow'],
	['RED ALERT', 'red']
]);

export class EmptyEpsilonClient {
	constructor({ host = EMPTY_EPSILON_HOST, port = EMPTY_EPSILON_PORT } = {}) {
		if (host && port) {
			this.isEmulated = false;
			const url = `http://${host}:${port}`;
			this.getUrl = `${url}/get.lua`;
			this.setUrl = `${url}/set.lua`;
		} else {
			this.isEmulated = true;
			logger.info('Empty Epsilon configuration not provided, initializing emulator');
			this.getUrl = 'http://ee-emulation.local/get.lua';
			this.setUrl = 'http://ee-emulation.local/set.lua';
			initEmulator();
		}
	}

	getConnectionStatus() {
		return {
			isConnectionHealthy: this.isConnectionHealthy,
			lastErrorMessage: this.lastErrorMessage || null,
			isEmulated: this.isEmulated
		};
	}

	setIsConnectionHealthy(value, error) {
		const errorMessage = get(error, 'message');
		const { isConnectionHealthy, lastErrorMessage } = this;
		if (value === isConnectionHealthy && errorMessage === lastErrorMessage) return;
		if (value) {
			logger.success('Connection to Empty Epsilon succeeded');
		} else {
			logger.error('Connection to Empty Epsilon failed:', errorMessage);
		}
		this.lastErrorMessage = errorMessage;
		this.isConnectionHealthy = value;
	}

	getGameState() {
		return axios.get(this.getUrl, { params: requestParameters }).then((res, err) => {
			// Handle connection errors
			if (err) throw new Error(err);
			// Handle Empty Epsilon response errors that use inconsistent keys
			const emptyEpsilonError = get(res, 'data.ERROR') || get(res, 'data.error');
			if (emptyEpsilonError) throw new Error(emptyEpsilonError);
			// Otherwise assume valid connection
			this.setIsConnectionHealthy(true);
			return Object.keys(res.data).reduce((data, key) => {
				let keyPrefix;
				if (key.includes('Health')) keyPrefix = 'systems.health';
				else if (key.includes('Heat')) keyPrefix = 'systems.heat';
				else if (key.includes('Count')) keyPrefix = 'weapons';
				else keyPrefix = 'general';
				return set(data, `${keyPrefix}.${key}`, res.data[key]);
			}, {});
		}).then(state => {
			const { shipHull, shipHullMax } = pick(get(state, 'general', {}), ['shipHull', 'shipHullMax']);
			if (isInteger(shipHull) && isInteger(shipHullMax)) {
				set(state, 'general.shipHullPercent', shipHull / shipHullMax);
			}
			return state;
		}).then(state => {
			this.previousState = state;
			return state;
		}).catch(error => {
			this.setIsConnectionHealthy(false, error);
			return { error };
		});
	}

	getAlertLevel() {
		return axios.get(`${this.getUrl}?alertLevel=getAlertLevel()`)
			.then(res => get(res.data.alertLevel));
	}

	setAlertLevel(level) {
		const url = `${this.setUrl}?commandSetAlertLevel("${level}")`;
		if (!['normal', 'yellow', 'red'].includes(level))
			throw new Error(`Allowed alert levels are 'normal', 'yellow' and 'red'`);
		return axios.get(url).then(res => {
			if (get(res, 'data.ERROR')) throw new Error(res.data.ERROR);
			logger.success(`Ship alert level set to ${level}`);
		});
	}

	setHullHealthPercent(percentValue) {
		const hullMaxHealth = get(this.previousState, 'general.shipHullMax');
		if (!hullMaxHealth) throw new Error('No hull max health available');
		const healthPointValue = Math.floor(percentValue * hullMaxHealth);
		const url = `${this.setUrl}?setHull("${healthPointValue}")`;
		return axios.get(url).then(res => {
			if (get(res, 'data.ERROR')) throw new Error(res.data.ERROR);
			logger.success(`Ship hull health set to ${healthPointValue}`);
		});
	}

	setGameState(command, target, value) {
		// Only allow known commands to be used
		if (!['setSystemHealth', 'setSystemHeat', 'setWeaponStorage'].includes(command))
			return Promise.reject('Invalid command', command);
		return axios.get(`${this.setUrl}?${command}("${target}",${value})`).then(res => {
			if (get(res, 'data.ERROR')) throw new Error(res.data.ERROR);
			logger.success('Empty Epsilon game state set', command, target, value);
			return res;
		});
	}

	async pushFullGameState(state) {
		const commands = fullStateToCommands(state);
		const alertLevel = alertStates.get(state.general.alertLevel);
		await Promise.all([
			...commands.map(({ command, target, value }) => this.setGameState(command, target, value)),
			this.setAlertLevel(alertLevel),
			this.setHullHealthPercent(get(state, 'general.shipHullPercent', 1)),
		]);
		return { success: true };
	}
}

let emptyEpsilonClient;
export function getEmptyEpsilonClient(config = {}) {
	if (emptyEpsilonClient) return emptyEpsilonClient;
	emptyEpsilonClient = new EmptyEpsilonClient(config);
	return emptyEpsilonClient;
}

/**
 * This aims to emulate a Empty Epsilon server when connection details to a real
 * one have not been provided
 */
let mockState;
function initEmulator() {
	mockState = require('../fixtures/emptyepsilon');
	nock('http://ee-emulation.local', { encodedQueryParams: true })
		.persist()
		.get(/\/get\.lua.*/)
		.query(true)
		.reply((uri, requestBody, cb) => {
			cb(null, [200, mockState, []]);
		});
	nock('http://ee-emulation.local', { encodedQueryParams: true })
		.persist()
		.get(/\/set\.lua.*/)
		.query(true)
		.reply(function (uri, requestBody, cb) {
			const req = decodeURI(this.req.path);
			const target = req.replace(/.*"(\w.*)".*/, '$1');
			let value = Number(req.replace(/.*,([0-9.]*)\)/, '$1'));
			if (req.includes('setSystemHealth') && systems.includes(target)) {
				mockState[`${target}Health`] = value;
				return cb(null, [200, mockState, []]);
			}
			if (req.includes('setSystemHeat') && systems.includes(target)) {
				mockState[`${target}Heat`] = value;
				return cb(null, [200, mockState, []]);
			}
			if (req.includes('setWeaponStorage') && weapons.includes(target)) {
				mockState[`${target}Count`] = value;
				return cb(null, [200, mockState, []]);
			}
			if (req.includes('commandSetAlertLevel')) {
				let alertLevel;
				value = req.replace(/.*"(\w.*)".*/, '$1');
				if (value === 'normal') alertLevel = 'Normal';
				else if (value === 'yellow') alertLevel = 'YELLOW ALERT';
				else if (value === 'red') alertLevel = 'RED ALERT';
				mockState.alertLevel = alertLevel;
				return cb(null, [200, mockState, []]);
			}
			return cb(null, [200, { ERROR: 'Something went wrong' }]);
		});
}

export default { EmptyEpsilonClient, getEmptyEpsilonClient };
