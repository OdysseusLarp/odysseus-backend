import { configureStore } from 'redux-starter-kit';
import { Store } from '../models/store';
import { isEmpty, throttle } from 'lodash';
import dataReducer from './reducers/dataReducer';

const store = configureStore({
	reducer: {
		data: dataReducer,
	}
});

async function saveState(data, id) {
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

store.subscribe(() => {
	const { data } = store.getState();
	if (isEmpty(data)) return;
	throttledSaveState(data, 'data');
});

export default store;
