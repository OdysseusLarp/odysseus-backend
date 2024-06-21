import nock from 'nock';

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
let mockState;
export function initEmptyEpsilonEmulator() {
	mockState = require('../../../fixtures/emptyepsilon');
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
