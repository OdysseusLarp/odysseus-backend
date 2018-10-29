import { Router } from 'express';
import { Task } from '../models/task';
import { handleAsyncErrors } from '../helpers';
const router = new Router();

router.get('/', handleAsyncErrors(async (req, res) => {
	const tasks = await Task.forge().fetchAll();
	const state = { tasks };
	res.json(state);
}));

router.get('/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	const tasks = await Task.forge({ id }).fetch();
	const state = { tasks };
	res.json(state);
}));

router.get('/box', handleAsyncErrors(async (req, res) => {
	// const state = await Box.forge().fetchAll({
	// 	withRelated: 'tasks'
	// });
	const state = {};
	res.json(state);
}));

router.get('/box/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	// const state = await Box.forge({ id }).fetch({
	// 	withRelated: 'tasks'
	// });
	const state = {};
	res.json(state);
}));

router.get('/box/:id/config', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	// TODO: Get box config
	const state = { id };
	res.json(state);
}));

router.post('/box/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	const { value } = req.body;
	// TODO: Validate value from request body
	// TODO: Validate new value against task requirements attached to this box
	await Box.forge({ id }).save({ value: { value } }, { method: 'update' });
	const state = await Box.forge({ id }).fetch({
		withRelated: 'tasks'
	});
	res.json(state);
	req.io.to('engineering').emit('boxStateUpdated', state);
}));

export default router;
