import { logger } from '@/logger';
import { getData } from '@/routes/data';
import axios from 'axios';
import { forIn, get, isNumber, pick, set } from 'lodash';
import { initEmptyEpsilonEmulator } from './emulator';

const { EMPTY_EPSILON_HOST, EMPTY_EPSILON_PORT } = process.env;

const alertStates = {
	Normal: 'normal',
	'YELLOW ALERT': 'yellow',
	'RED ALERT': 'red',
} as const;

export const LandingPadStates = {
	Destroyed: 0, // Destroyed or not allowed by GMs
	Docked: 1,
	Launched: 2,
} as const;

const LandingPadStateToText = {
	[LandingPadStates.Destroyed]: 'Destroyed',
	[LandingPadStates.Docked]: 'Docked',
	[LandingPadStates.Launched]: 'Launched',
};

export type AlertLevel = (typeof alertStates)[keyof typeof alertStates];
export type EmptyEpsilonState = Record<string, any>;
export type LandingPadState = (typeof LandingPadStates)[keyof typeof LandingPadStates];

export class EmptyEpsilonClient {
	private isEmulated: boolean;
	private getUrl: string;
	private setUrl: string;
	private isConnectionHealthy: boolean;
	private lastErrorMessage: string | null | undefined;
	private previousState: EmptyEpsilonState | undefined;

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
			initEmptyEpsilonEmulator();
		}
	}

	getConnectionStatus() {
		return {
			isConnectionHealthy: this.isConnectionHealthy,
			lastErrorMessage: this.lastErrorMessage || null,
			isEmulated: this.isEmulated,
		};
	}

	setIsConnectionHealthy(value: boolean, error?: Error) {
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

	getGameState(): Promise<EmptyEpsilonState> {
		return axios
			.get(this.getUrl, { params: this.getGameStateRequestParameters() })
			.then(res => {
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
					else if (key.startsWith('landingPadStatus')) keyPrefix = 'landingPads';
					else keyPrefix = 'general';
					return set(data, `${keyPrefix}.${key}`, res.data[key]);
				}, {});
			})
			.then(state => {
				const { shipHull, shipHullMax } = pick(get(state, 'general', {} as any), ['shipHull', 'shipHullMax']);
				if (isNumber(shipHull) && isNumber(shipHullMax)) {
					set(state, 'general.shipHullPercent', shipHull / shipHullMax);
				}
				return state;
			})
			.then(state => {
				this.previousState = state;
				return state;
			})
			.catch(error => {
				this.setIsConnectionHealthy(false, error);
				return { error };
			});
	}

	getAlertLevel() {
		return axios.get(`${this.getUrl}?alertLevel=getAlertLevel()`).then(res => get(res.data, 'alertLevel'));
	}

	setAlertLevel(level: AlertLevel) {
		const url = `${this.setUrl}?commandSetAlertLevel("${level}")`;
		if (!['normal', 'yellow', 'red'].includes(level))
			throw new Error(`Allowed alert levels are 'normal', 'yellow' and 'red'`);
		return axios.get(url).then(res => {
			if (get(res, 'data.ERROR')) throw new Error(res.data.ERROR);
			logger.success(`Ship alert level set to ${level}`);
		});
	}

	public setHullHealthPercent(hullHealthPercent: number) {
		const hullMaxHealth = get(this.previousState, 'general.shipHullMax');
		if (!hullMaxHealth) throw new Error('No hull max health available');
		const healthPointValue = Math.floor(hullHealthPercent * hullMaxHealth);
		const url = `${this.setUrl}?setHull("${healthPointValue}")`;
		return axios.get(url).then(res => {
			if (get(res, 'data.ERROR')) throw new Error(res.data.ERROR);
			logger.success(`Ship hull health set to ${healthPointValue}`);
		});
	}

	public setLandingPadState(landingPadNumber: number, state: LandingPadState) {
		if (![0, 1, 2].includes(state)) throw new Error('Invalid landing pad state');
		const url = `${this.setUrl}?setLandingPadState(${landingPadNumber},${state})`;
		return axios.get(url).then(res => {
			if (get(res, 'data.ERROR')) throw new Error(res.data.ERROR);
			logger.success(`Landing pad ${landingPadNumber} state set to ${state} (${LandingPadStateToText[state]})`);
		});
	}

	public setGameState(command: string, target: string, value: any) {
		const isEeConnectionEnabled = !!get(getData('ship', 'metadata'), 'ee_connection_enabled');
		if (!isEeConnectionEnabled) {
			logger.warn('setGameState was called while Backend <-> EE connection is disabled', { command, target, value });
			return;
		}
		// Only allow known commands to be used
		if (!['setSystemHealth', 'setSystemHeat', 'setWeaponStorage', 'setLandingPadState'].includes(command))
			return Promise.reject(`Rejecting unknown command '${command}'`);
		return axios.get(`${this.setUrl}?${command}("${target}",${value})`).then(res => {
			if (get(res, 'data.ERROR')) throw new Error(res.data.ERROR);
			logger.success('Empty Epsilon game state set', command, target, value);
			return res;
		});
	}

	public async pushFullGameState(state: Record<string, any>) {
		const commands = this.fullStateToApiCommands(state);
		const alertLevel = alertStates[state.general.alertLevel];
		await Promise.all([
			...commands.map(({ command, target, value }) => this.setGameState(command, target, value)),
			this.setAlertLevel(alertLevel),
			this.setHullHealthPercent(get(state, 'general.shipHullPercent', 1)),
		]);
		return { success: true };
	}

	private fullStateToApiCommands(state: EmptyEpsilonState) {
		const { heat, health } = state.systems;
		const { weapons } = state;
		const commands = [];
		forIn(heat, (value, key) =>
			commands.push({
				command: 'setSystemHeat',
				target: key.replace(/Heat$/, ''),
				value,
			})
		);
		forIn(health, (value, key) =>
			commands.push({
				command: 'setSystemHealth',
				target: key.replace(/Health$/, ''),
				value,
			})
		);
		forIn(weapons, (value, key) =>
			commands.push({
				command: 'setWeaponStorage',
				target: key.replace(/Count$/, ''),
				value,
			})
		);
		forIn(state.landingPads, (value, key) => {
			const landingPadNumber = key.replace('landingPadStatus', '');
			commands.push({
				command: 'setLandingPadState',
				target: landingPadNumber,
				value,
			});
		});
		return commands;
	}

	private getGameStateRequestParameters() {
		return {
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
			alertLevel: 'getAlertLevel()',
			landingPadStatus1: 'getLandingPadState(1)', // Fighter 1
			landingPadStatus2: 'getLandingPadState(2)', // Fighter 2
			landingPadStatus3: 'getLandingPadState(3)', // Fighter 3
			landingPadStatus4: 'getLandingPadState(4)', // Starcaller
		};
	}
}

let emptyEpsilonClient;
export function getEmptyEpsilonClient(config = {}): EmptyEpsilonClient {
	if (emptyEpsilonClient) return emptyEpsilonClient;
	emptyEpsilonClient = new EmptyEpsilonClient(config);
	return emptyEpsilonClient;
}

export default { EmptyEpsilonClient, getEmptyEpsilonClient };
