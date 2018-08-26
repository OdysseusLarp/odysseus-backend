require('dotenv').config({ silent: true });
import logger from 'signale';
import axios from 'axios';
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

export default class EmptyEpsilonClient {
	constructor({ host = EMPTY_EPSILON_HOST, port = EMPTY_EPSILON_PORT } = {}) {
		const url = `http://${host}:${port}`;
		this.getUrl = `${url}/get.lua`;
		this.setUrl = `${url}/set.lua`;
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
