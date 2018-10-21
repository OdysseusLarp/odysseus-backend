import { isInteger, isString } from 'lodash';
import {
	TaskNotFoundError,
	TaskAlreadyLoadedError,
	TaskNotLoadedError,
	InvalidParametersError
} from '../../errors';
import { logger } from '../../logger';

const loadedTasks = {};
const boxStates = {};
const initialTasks = [
	{ id: 1, filename: '01-example-task' }
];

export function loadTask({ id, filename }) {
	if (!isInteger(id) || !isString(filename)) throw new InvalidParametersError('Invalid parameters');
	if (loadedTasks[id]) throw new TaskAlreadyLoadedError(`Task ${id} is already loaded`);
	const Task = require(`./${filename}`).default;
	if (!Task) throw new TaskNotFoundError(`${filename} does not contain a valid task`);
	loadedTasks[id] = filename;
	const task = new Task({ id, filename, state: boxStates });
	loadedTasks[id] = task;
	logger.success(`Loaded task ${id} from ${filename}`);
}

export function unloadTask(id) {
	if (isInteger(id)) throw new InvalidParametersError('Invalid parameters');
	if (loadedTasks[id]) throw new TaskAlreadyLoadedError(`Task ${id} is already loaded`);
	const filename = loadedTasks[id];
	if (!filename) throw new TaskNotLoadedError('Task not loaded');
	// reset require cache
	delete require.cache[require.resolve(`./${filename}`)];
	logger.success(`Unloaded task ${id}`);
}

export function loadInitialTasks() {
	logger.info('Loading initial engineering tasks');
	initialTasks.forEach(loadTask);
}
