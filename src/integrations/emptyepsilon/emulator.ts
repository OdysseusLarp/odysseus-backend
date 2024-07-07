import nock from 'nock';
import { mockEmptyEpsilonGameState, mockEmptyEpsilonLaunchPadStatuses } from '@fixtures/emptyepsilon';
import { cloneDeep, pick, isEmpty } from 'lodash';

const systems = [
	'reactor',
	'beamweapons',
	'missilesystem',
	'maneuver',
	'impulse',
	'warp',
	'jumpdrive',
	'frontshield',
	'rearshield',
];
const weapons = ['homing', 'nuke', 'mine', 'emp', 'hvli'];

/**
 * This aims to emulate a Empty Epsilon server when connection details to a real
 * one have not been provided
 */
let mockState = cloneDeep(mockEmptyEpsilonGameState);
export function initEmptyEpsilonEmulator() {
	// Mock the basic game state query
	nock('http://ee-emulation.local', { encodedQueryParams: true })
		.persist()
		.get(/\/get\.lua.*/)
		.query(queryObject => {
			const queryString = new URLSearchParams(queryObject).toString();
			return !queryString.includes('landingPadStatus1');
		})
		.reply((uri, requestBody, cb) => {
			cb(null, [200, mockState, []]);
		});

	// Mock the landing pad status query
	nock('http://ee-emulation.local', { encodedQueryParams: true })
		.persist()
		.get(/\/get\.lua.*/)
		.query(queryObject => {
			const queryString = new URLSearchParams(queryObject).toString();
			return queryString.includes('landingPadStatus1');
		})
		.reply((uri, requestBody, cb) => {
			const landingPadStatuses = pick(mockState, [
				'landingPadStatus1',
				'landingPadStatus2',
				'landingPadStatus3',
				'landingPadStatus4',
			]);
			const statuses = isEmpty(landingPadStatuses) ? cloneDeep(mockEmptyEpsilonLaunchPadStatuses) : landingPadStatuses;
			cb(null, [200, statuses, []]);
		});

	// Mock the set commands
	nock('http://ee-emulation.local', { encodedQueryParams: true })
		.persist()
		.get(/\/set\.lua.*/)
		.query(true)
		.reply(function (uri, requestBody, cb) {
			const req = decodeURI(this.req.path);
			const target = req.replace(/.*"(\w.*)".*/, '$1');
			let value: string | number = Number(req.replace(/.*,(-?[0-9.]*)\)/, '$1'));
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
			if (req.includes('setHull')) {
				const val = Number(req.replace(/.*setHull\("([0-9]*)"\).*/, '$1'));
				mockState.shipHull = val;
				return cb(null, [200, mockState, []]);
			}
			if (req.includes('setLandingPadStatus')) {
				const pad = Number(req.replace(/.*setLandingPadStatus\("([0-9]*)",.*/, '$1'));
				const status = Number(req.replace(/.*setLandingPadStatus\("[0-9]*",([0-9]*)\).*/, '$1'));
				mockState[`landingPadStatus${pad}`] = status;
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

	let isDamageDmxEnabled = true;

	nock('http://ee-emulation.local', { encodedQueryParams: true })
		.persist()
		.post(/\/exec\.lua.*/)
		.reply((uri, requestBody, cb) => {
			const req = requestBody.toString();
			if (req.includes('enableDamageDmx')) {
				isDamageDmxEnabled = true;
				cb(null, [200, '', []]);
				return;
			}

			if (req.includes('disableDamageDmx')) {
				isDamageDmxEnabled = false;
				cb(null, [200, '', []]);
				return;
			}

			if (req.includes('isDamageDmxEnabled')) {
				cb(null, [200, isDamageDmxEnabled ? 'true' : 'false', []]);
				return;
			}
			cb(null, [200, 'Unknown command', []]);
		});
}
