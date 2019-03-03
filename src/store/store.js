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
		const currentObject = getPath(path);
		const currentState = store.getState();
		if (currentObject !== previousObject) {
			if (initialized) {
				// Use setTimeout instead of nextTick to not starve IO in case of infinite loop
				setTimeout(() => callback(currentObject, previousObject, currentState), 0);
			}
			previousObject = currentObject;
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
