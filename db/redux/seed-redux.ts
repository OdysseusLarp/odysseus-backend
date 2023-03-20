import store, { initState } from '../../src/store/store';
import { saveState } from '../../src/store/storePersistance';
import { knex } from '../';
import { logger } from '../../src/logger';

async function seed() {
	logger.info('Initializing Redux with empty state');
	await knex('store').del();
	initState({});

	require('./box');
	require('./ship');
	require('./game');
	require('./misc');

	logger.info('Saving the Redux state to database');
	saveState(store.getState().data, 'data')
		.then(() => {
			logger.success('Redux state saved');
			process.exit(0);
		}).catch(err => {
			logger.error(err);
			process.exit(1);
		});
}

seed();
