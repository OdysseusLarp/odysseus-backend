import { Router } from 'express';
import { Task, Box } from '../models';
const router = new Router();

router.get('/', async (req, res, next) => {
	const tasks = await Task.forge().fetchAll({
		withRelated: ['requirements', 'requirements.box']
	}).catch(next);
	const state = { tasks };
	res.json(state);
});

router.get('/:id', async (req, res, next) => {
	const { id } = req.params;
	const tasks = await Task.forge({ id }).fetch({
		withRelated: ['requirements', 'requirements.box']
	}).catch(next);
	const state = { tasks };
	res.json(state);
});

router.get('/box', async (req, res) => {
	const state = await Box.forge().fetchAll({
		withRelated: 'tasks'
	});
	res.json(state);
});

router.get('/box/:id', async (req, res) => {
	const { id } = req.params;
	const state = await Box.forge({ id }).fetch({
		withRelated: 'tasks'
	});
	res.json(state);
});

router.post('/box/:id', async (req, res) => {
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
});

export default router;
