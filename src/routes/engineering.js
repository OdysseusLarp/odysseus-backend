import BigNumber from 'bignumber.js';
import { Router } from 'express';
import { Task } from '../models/task';
import { Box } from '../models/box';
import { loadedTasks, loadTask, unloadTask, onBoxValueChange } from '../engineering/tasks';
import { handleAsyncErrors } from '../helpers';
import { logger } from '../logger';
const router = new Router();

const VALIDATE_BOX_VERSIONS = !process.env.DISABLE_BOX_VERSION_VALIDATION;
if (!VALIDATE_BOX_VERSIONS) {
	logger.warn('Engineering Box versions will NOT be validated on update');
}

/**
 * Get a list of all tasks
 * @route GET /engineering/task
 * @group Task - Operations related to engineering tasks
 * @returns {Array.<Task>} 200 - List of all tasks
 */
router.get('/task', handleAsyncErrors(async (req, res) => {
	res.json(await Task.forge().fetchAll());
}));

/**
 * Get a specific task by task id
 * @route GET /engineering/task/{id}
 * @group Task - Operations related to engineering tasks
 * @param {integer} id.path.required - task id
 * @returns {Task.model} 200 - Specific task
 */
router.get('/task/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Task.forge({ id: req.params.id }).fetch());
}));

/**
 * Update a specific task by task id
 * @route PUT /engineering/task/{id}
 * @consumes application/json
 * @group Task - Operations related to engineering tasks
 * @param {integer} id.path.required - task id
 * @param {Task.model} task.body.required - task object fields to be updated
 * @returns {Task.model} 200 - Updated task values
 * @returns {Error}  502 - Error if task with given id is not loaded
 */
router.put('/task/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params, task = loadedTasks[id], patch = req.body;
	if (!task) throw new Error(`Task ${id} is not loaded`);
	res.json(await task.getModel().then(model => model.save(patch, { method: 'update' })));
}));

/**
 * Load or reload specific task by task id
 * @route PUT /engineering/task/{id}/load
 * @consumes application/json
 * @group Task - Operations related to engineering tasks
 * @param {integer} id.path.required - Task id
 * @param {string} filename.body.required - Filename of the task file to be loaded
 * @param {boolean} reload.body - Boolean defining if task should reload in case it is already loaded
 * @returns {Task.model} 200 - Loaded task
 * @returns {Error}  502 - Error if task is already loaded
 */
router.post('/task/:id/load', handleAsyncErrors(async (req, res) => {
	const { id } = req.params, { filename, reload } = req.body, task = loadedTasks[id];
	if (!reload && task) throw new Error(`Task ${id} is already loaded`);
	else if (reload && task) unloadTask({ id, throwIfNotExists: false });
	// TODO: validate request body, especially filename to prevent reading any file from disk
	const { model } = await loadTask({ id, filename });
	// TODO: actually check that the task gets loaded, both the task file + info from db
	res.json(model);
}));

/**
 * Unload or reload specific task by task id
 * @route PUT /engineering/task/{id}/unload
 * @consumes application/json
 * @group Task - Operations related to engineering tasks
 * @param {integer} id.path.required - Task id
 * @returns {} 204 - Empty response on success
 * @returns {Error}  502 - Error if task is not loaded
 */
router.put('/task/:id/unload', handleAsyncErrors(async (req, res) => {
	unloadTask({ id: req.params.id });
	res.status(204).end();
}));

/**
 * Get list of all engineering boxes
 * @route GET /engineering/box
 * @group Box - Operations related to engineering boxes
 * @returns {Array.<Box>} 200 - List of all Box values
 */
router.get('/box', handleAsyncErrors(async (req, res) => {
	res.json(await Box.forge().fetchAll());
}));

/**
 * Get a specific engineering box by id
 * @route GET /engineering/box/{id}
 * @group Box - Operations related to engineering boxes
 * @param {string} id.path.required - Box id
 * @returns {Box.model} 200 - Box value
 */
router.get('/box/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Box.forge({ id: req.params.id }).fetch());
}));

/**
 * Insert or update a specific box by box id
 * @route POST /engineering/box/{id}
 * @consumes application/json
 * @group Box - Operations related to engineering boxes
 * @param {string} id.path.required - Box id
 * @param {Box.model} box.body.required - Box object fields to be updated
 * @returns {Box.model} 200 - Updated Box values
 * @returns {Error}  409 - Error if submitted box version is lower or equal to current version
 */
router.post('/box/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params, { value, version } = req.body;
	const newVersion = new BigNumber(version || 1);
	// TODO: Validate value & version from request body
	let box = await Box.forge({ id }).fetch();
	if (!box) box = await Box.forge().save(
		{ id, value, version: newVersion.toString() }, { method: 'insert' });
	else {
		const currentVersion = BigNumber(box.get('version'));
		if (VALIDATE_BOX_VERSIONS && newVersion.isLessThanOrEqualTo(currentVersion)) {
			return res.status(409).json({ error: `Currently on version number ${currentVersion.toString()}` });
		}
		await box.save({ value, version: newVersion.toString() }, { method: 'update' });
	}
	onBoxValueChange();
	res.json(box);
	req.io.to('engineering').emit('boxStateUpdated', box);
}));

export default router;
