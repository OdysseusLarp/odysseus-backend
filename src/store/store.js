import { configureStore } from 'redux-starter-kit';
import dataReducer from './reducers/dataReducer';

let resolver;
/**
 * Boolean indicating whether the Redux store has been initialized with the initial values.
 */
export let initialized = false;
/**
 * Promise that will be resolved when the Redux store is initialized with the initial values.
 */
export let initPromise = new Promise((resolve, reject) => { resolver = resolve });

export const store = configureStore({
	reducer: {
		data: dataReducer,
	}
});

/**
 * Return an object at a specific path in the Redux store.
 * 
 * @param {string[]} path 	array of strings defining the object path to watch, e.g. `['data','task','myid']`
 * @returns					object at the path, or `undefined` 
 */
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

/**
 * Watch a specific path of the Redux store. The callback is called
 * asynchronously with parameters `(currentObject, previousObject, currentState)`.
 * 
 * `currentObject` and `currentState` represent the state at the time when the event
 * occurred, and is not necessarily the same as the current state.
 * 
 * @param {string[]} path 		array of strings defining the object path to watch, e.g. `['data','task','myid']`
 * @param {function} callback 	function to call asynchronously
 */
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

