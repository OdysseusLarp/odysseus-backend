import store, { initState } from '../../src/store/store';
import { saveState } from '../../src/store/storePersistance';
import { knex } from '../../db';

async function seed() {
	console.log('Initializing Redux with empty state');
	await knex('store').del();
	initState({});

	require('./box');
	require('./ship');
	require('./game');
	require('./misc');

	console.log('Saving the Redux state');
	saveState(store.getState().data, 'data').then(() => process.exit());
}

seed();
