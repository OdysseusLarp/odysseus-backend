import { configureStore } from 'redux-starter-kit';
import dataReducer from './reducers/dataReducer';

let resolver;
export let initialized = false;
export let initPromise = new Promise((resolve, reject) => { resolver = resolve });

export const store = configureStore({
	reducer: {
		data: dataReducer,
	}
});

export function getPath(path) {
	let o = store.getState();
	while (path && path.length > 0) {
		if (o[path[0]]) {
			o = o[path[0]];
		} else {
			return undefined;
		}
		path = path.slice(1)
	}
	return o;
}

export function watch(path, callback) {
	let previousObject = getPath(path);
	store.subscribe(() => {
		const newObject = getPath(path);
		if (newObject !== previousObject) {
			if (initialized) {
				callback(newObject, previousObject);
			}
			previousObject = newObject;
		}
	});
}

export function initState(state) {
	store.dispatch({
		type: 'OVERWRITE_STATE',
		state
	});
	initialized = true;
	resolver();
}

export default store;
