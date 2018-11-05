import { isInteger, isString, get, isFunction } from 'lodash';
import {
	TaskNotFoundError,
	TaskAlreadyLoadedError,
	TaskNotLoadedError,
	InvalidParametersError
} from '../../errors';
import { logger } from '../../logger';

export const loadedTasks = {};

const initialTasks = [
	{ id: 1, filename: '01-example-task' }
];

export async function loadTask({ id, filename }) {
	if (!isInteger(Number(id)) || !isString(filename)) throw new InvalidParametersError('Invalid parameters');
	if (loadedTasks[id]) throw new TaskAlreadyLoadedError(`Task ${id} is already loaded`);
	const Task = require(`./${filename}`).default;
	if (!Task) throw new TaskNotFoundError(`${filename} does not contain a valid task`);
	loadedTasks[id] = filename;
	const task = await new Task({ id, filename }).loadModel();
	loadedTasks[id] = task;
	logger.success(`Loaded task ${id} from ${filename}`);
	return task;
}

export function unloadTask({ id, throwIfNotExists = true }) {
	if (isInteger(id)) throw new InvalidParametersError('Invalid parameters');
	const task = loadedTasks[id];
	if (throwIfNotExists && !task) throw new TaskNotLoadedError(`Task ${id} is not loaded`);
	const filename = get(task, 'filename');
	if (!filename) throw new TaskNotLoadedError('Task not loaded');
	if (isFunction(task.cleanup)) task.cleanup();
	delete loadedTasks[id];
	// reset require cache
	delete require.cache[require.resolve(`./${filename}`)];
	logger.success(`Unloaded task ${id}`);
}

// Validate all loaded tasks
export async function validateLoadedTasks() {
	// TODO: Might benefit from concurrency, needs testing with a lot of loaded tasks
	await Object.keys(loadedTasks).forEach(async id => {
		const task = loadedTasks[id];
		if (!isFunction(task.validate)) throw new Error(`Task ${id} does not have a validate function`);
		await task.validate();
	});
	return loadedTasks;
}

/*
 * This should be called whenever a box value is changed, so that loaded tasks that implement
 * onBoxValueChange can run whatever logic they need to run (validations etc.)
 */
export async function onBoxValueChange(boxId) {
	await Object.keys(loadedTasks).forEach(async id => {
		const task = loadedTasks[id];
		if (!isFunction(task.validate)) throw new Error(`Task ${id} does not have a validate function`);
		await task.validate();
		if (isFunction(task.onBoxValueChange)) await task.onBoxValueChange(boxId);
	});
	return loadedTasks;
}

export function loadInitialTasks() {
	logger.info('Loading initial engineering tasks');
	initialTasks.forEach(loadTask);
}
