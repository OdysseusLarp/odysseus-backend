import test from 'ava';
import nock from 'nock';
import { EmptyEpsilonClient, getEmptyEpsilonClient } from '../src/emptyepsilon';

// Disable real http communications
nock.disableNetConnect();

// Line below can be used to record actual http requests so they can turned into mocks
// nock.recorder.rec();

test('succesful getGameState should set state to healthy', async t => {
	nock('http://localhost:8080', { "encodedQueryParams": true })
		.get('/get.lua')
		.query(true)
		.reply(200, {}, []);
	const emptyEpsilon = new EmptyEpsilonClient();
	const gameState = await emptyEpsilon.getGameState();
	t.truthy(emptyEpsilon.isConnectionHealthy);
});

test('failing getGameState should set state to unhealthy', async t => {
	nock('http://localhost:8080', { "encodedQueryParams": true })
		.get('/get.lua')
		.query(true)
		.reply(500, { 'ERROR': 'mock error' },
			[
				'Content-type',
				'text/html',
				'Connection',
				'Keep-Alive',
				'Transfer-Encoding',
				'chunked'
			]);
	const emptyEpsilon = new EmptyEpsilonClient();
	const gameState = await emptyEpsilon.getGameState();
	t.falsy(emptyEpsilon.isConnectionHealthy);
});

test('should parse getGameState reponse correctly', async t => {
	nock('http://localhost:8080', { "encodedQueryParams": true })
		.get('/get.lua')
		.query(true)
		.reply(200, {
			"reactorHeat": 0,
			"homingCount": 12,
			"nukeCount": 4,
			"frontshieldHealth": 1,
			"rearshieldHeat": 0,
			"missilesystemHeat": 0,
			"maneuverHeat": 0,
			"jumpdriveHealth": 1,
			"beamweaponsHeat": 0,
			"frontshieldHeat": 0,
			"hvliCount": 20,
			"impulseHeat": 0,
			"jumpdriveHeat": 0,
			"rearshieldHealth": 1,
			"warpHeat": 0,
			"impulseHealth": 1,
			"missilesystemHealth": 1,
			"reactorHealth": 1,
			"maneuverHealth": 1,
			"mineCount": 8,
			"warpHealth": 1,
			"beamweaponsHealth": 1,
			"empCount": 6
		}, []);
	const emptyEpsilon = new EmptyEpsilonClient();
	const gameState = await emptyEpsilon.getGameState();
	t.truthy(emptyEpsilon.isConnectionHealthy);
	t.deepEqual(gameState, {
		systems: {
			heat: {
				reactorHeat: 0,
				rearshieldHeat: 0,
				missilesystemHeat: 0,
				maneuverHeat: 0,
				beamweaponsHeat: 0,
				frontshieldHeat: 0,
				impulseHeat: 0,
				jumpdriveHeat: 0,
				warpHeat: 0
			},
			health: {
				frontshieldHealth: 1,
				jumpdriveHealth: 1,
				rearshieldHealth: 1,
				impulseHealth: 1,
				missilesystemHealth: 1,
				reactorHealth: 1,
				maneuverHealth: 1,
				warpHealth: 1,
				beamweaponsHealth: 1
			}
		},
		weapons: {
			homingCount: 12,
			nukeCount: 4,
			hvliCount: 20,
			mineCount: 8,
			empCount: 6
		}
	})
});

test('getEmptyEpsilonClient should only create one instance of the client', t => {
	const clientOne = getEmptyEpsilonClient();
	const clientTwo = getEmptyEpsilonClient();
	t.truthy(clientOne instanceof EmptyEpsilonClient);
	t.is(clientOne, clientTwo);
})