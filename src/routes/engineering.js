import BigNumber from 'bignumber.js';
import { Router } from 'express';
import { Task } from '../models/task';
import { Box } from '../models/box';
import { handleAsyncErrors } from '../helpers';
import { logger } from '../logger';
const router = new Router();

const VALIDATE_BOX_VERSIONS = !process.env.DISABLE_BOX_VERSION_VALIDATION;
if (!VALIDATE_BOX_VERSIONS) {
	logger.warn('Engineering Box versions will NOT be validated on update');
}

router.get('/task', handleAsyncErrors(async (req, res) => {
	const tasks = await Task.forge().fetchAll();
	const state = { tasks };
	res.json(state);
}));

router.get('/task/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	const tasks = await Task.forge({ id }).fetch();
	const state = { tasks };
	res.json(state);
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
