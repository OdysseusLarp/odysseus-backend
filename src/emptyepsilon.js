require('dotenv').config({ silent: true });
import { logger } from './logger';
import axios from 'axios';
import nock from 'nock';
import { get, set } from 'lodash';

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
	weapons = ['homing', 'nuke', 'mine', 'emp', 'hvli'];

export class EmptyEpsilonClient {
	constructor({ host = EMPTY_EPSILON_HOST, port = EMPTY_EPSILON_PORT } = {}) {
		if (host && port) {
			const url = `http://${host}:${port}`;
			this.getUrl = `${url}/get.lua`;
			this.setUrl = `${url}/set.lua`;
		} else {
			logger.info('Empty Epsilon configuration not provided, initializing emulator');
			this.getUrl = 'http://ee-emulation.local/get.lua';
			this.setUrl = 'http://ee-emulation.local/set.lua';
			initEmulator();
		}
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
				return set(data, `${keyPrefix || 'weapons'}.${key}`, res.data[key]);
			}, {});
		}).catch(error => {
			this.setIsConnectionHealthy(false, error);
			return { error };
		});
	};

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
}

function createRequestParameters(configs) {
	return configs.reduce((previous, next) =>
		next.targets.reduce((p, n) => {
			const obj = Object.assign({}, p);
			obj[n + next.keySuffix] = `${next.command}(\"${n}\")`;
			return obj;
		}, previous), {});
}

const requestParameters = createRequestParameters([
	{ keySuffix: 'Count', command: 'getWeaponStorage', targets: weapons },
	{ keySuffix: 'Health', command: 'getSystemHealth', targets: systems },
	{ keySuffix: 'Heat', command: 'getSystemHeat', targets: systems }
]);

let emptyEpsilonClient;
export function getEmptyEpsilonClient(config = {}) {
	if (emptyEpsilonClient) return emptyEpsilonClient;
	emptyEpsilonClient = new EmptyEpsilonClient(config);
	return emptyEpsilonClient;
};

/**
 * This aims to emulate a Empty Epsilon server when connection details to a real
 * one have not been provided
 */
let mockState;
function initEmulator() {
	mockState = require('../fixtures/emptyepsilon');
	nock('http://ee-emulation.local', { "encodedQueryParams": true })
		.persist()
		.get(/\/get\.lua.*/)
		.query(true)
		.reply(function (uri, requestBody, cb) {
			cb(null, [200, mockState, []]);
		});
	nock('http://ee-emulation.local', { "encodedQueryParams": true })
		.persist()
		.get(/\/set\.lua.*/)
		.query(true)
		.reply(function (uri, requestBody, cb) {
			const req = decodeURI(this.req.path);
			const target = req.replace(/.*"(\w.*)".*/, '$1');
			const value = Number(req.replace(/.*,([0-9.]*)\)/, '$1'));
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
			return cb(null, [200, { ERROR: 'Something went wrong' }]);
		});
}

export default { EmptyEpsilonClient, getEmptyEpsilonClient };
