import { Router } from 'express';
const router = new Router();

router.get('/', (req, res) => {
	// TODO: Reply with current state of the whole fleet
	res.json({});
});

router.get('/:id', (req, res) => {
	const { id } = req.params;
	// TODO: Reply with current state of the ship with the given ID
	res.json({ id });
});

router.put('/:id', (req, res) => {
	const { id } = req.params;
	// TODO: Update state of the ship with the given ID and return new state
	const state = { id };
	res.json(state);
	req.io.to('fleet').emit('shipStateUpdated', state);
});

router.get('/:id/population', (req, res) => {
	const { id } = req.params;
	// TODO: Reply with current population of the ship with the given ID
	// Might not be needed as this can be just included in the /ship/:id route response
	res.json({ id });
});

export default router;
