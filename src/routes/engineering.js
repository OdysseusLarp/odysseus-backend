import BigNumber from 'bignumber.js';
import { Router } from 'express';
import { Task } from '../models/task';
import { Box } from '../models/box';
import { loadedTasks, loadTask, unloadTask } from '../engineering/tasks';
import { handleAsyncErrors } from '../helpers';
import { logger } from '../logger';
const router = new Router();

const VALIDATE_BOX_VERSIONS = !process.env.DISABLE_BOX_VERSION_VALIDATION;
if (!VALIDATE_BOX_VERSIONS) {
	logger.warn('Engineering Box versions will NOT be validated on update');
}

router.get('/task', handleAsyncErrors(async (req, res) => {
	res.json(await Task.forge().fetchAll());
}));

router.get('/task/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Task.forge({ id: req.params.id }).fetch());
}));

router.put('/task/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params, task = loadedTasks[id], patch = req.body;
	if (!task) throw new Error(`Task ${id} is not loaded`);
	res.json(await task.getModel().then(model => model.save(patch, { method: 'update' })));
}));

router.post('/task/:id/load', handleAsyncErrors(async (req, res) => {
	const { id } = req.params, { filename, reload } = req.body, task = loadedTasks[id];
	if (!reload && task) throw new Error(`Task ${id} is already loaded`);
	else if (reload && task) unloadTask({ id, throwIfNotExists: false });
	// TODO: validate request body, especially filename to prevent reading any file from disk
	const { model } = await loadTask({ id, filename });
	// TODO: actually check that the task gets loaded, both the task file + info from db
	res.json(model);
}));

router.put('/task/:id/unload', handleAsyncErrors(async (req, res) => {
	unloadTask({ id: req.params.id });
	res.status(204).end();
}));

router.get('/box', handleAsyncErrors(async (req, res) => {
	res.json(await Box.forge().fetchAll());
}));

router.get('/box/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Box.forge({ id: req.params.id }).fetch());
}));

// Upsert for box values
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
			throw new Error(`Currently on version number ${currentVersion.toString()}`);
		}
		await box.save({ value, version: newVersion.toString() }, { method: 'update' });
	}
	res.json(box);
	req.io.to('engineering').emit('boxStateUpdated', box);
}));

export default router;
