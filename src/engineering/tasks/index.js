import { isInteger, isString, get } from 'lodash';
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
	if (throwIfNotExists && !loadedTasks[id]) throw new TaskNotLoadedError(`Task ${id} is not loaded`);
	const filename = get(loadedTasks, [id, 'filename']);
	if (!filename) throw new TaskNotLoadedError('Task not loaded');
	delete loadedTasks[id];
	// reset require cache
	delete require.cache[require.resolve(`./${filename}`)];
	logger.success(`Unloaded task ${id}`);
}

export function loadInitialTasks() {
	logger.info('Loading initial engineering tasks');
	initialTasks.forEach(loadTask);
}
