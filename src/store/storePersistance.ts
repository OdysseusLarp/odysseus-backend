import store from './store';
import { Store } from '../models/store';
import { isEmpty, throttle } from 'lodash';
import { logger } from '../logger';

async function saveState(data: Record<string, unknown>, id: string) {
	const oldState = await Store.forge({ id }).fetch();
	const method = oldState ? 'update' : 'insert';
	return Store.forge({ id }).save({ data }, { method });
}

const saveFrequency = parseInt(process.env.SAVE_STATE_FREQUENCY_MS, 10) || 5000;
const throttledSaveState = throttle(
	saveState,
	saveFrequency,
	{ leading: false, trailing: true }
);

export function enablePersistance() {
	logger.info(`Store persistance enabled, Redux state will be saved every ${saveFrequency}ms`);
	store.subscribe(() => {
		const { data } = store.getState();
		if (isEmpty(data)) {
			return;
		}
		throttledSaveState(data, 'data');
	});
}

const persistInMemoryState = async () => {
	const { data } = store.getState();
	if (isEmpty(data)) {
		return;
	}
	await saveState(data, 'data');
	logger.info('Redux state saved to database, exiting process');
	process.exit(0);
};

export function enableGracefulShutdown() {
	logger.info('Graceful shutdown enabled, Redux state will be saved right before exiting');
	process.on('SIGINT', persistInMemoryState);
	process.on('SIGTERM', persistInMemoryState);
}

export { saveState, throttledSaveState };
