import { Router } from 'express';
import { Ship, Grid } from '../models/ship';
const router = new Router();

/**
 * Get info of the grid where Odysseus is currently located including list of ships
 * @route GET /starmap/grid
 * @group Grid - Operations related to starmap grid
 * @returns {Grid.model} 200 - Current grid data
 */
router.get('/grid', async (req, res) => {
	const odysseus = await Ship.forge({ id: 'odysseus' }).fetch();
	res.json(await Grid.forge({ id: odysseus.get('grid_id') }).fetchWithRelated());
});

/**
 * Get info of the grid with given id including list of ships
 * @route GET /starmap/grid/{id}
 * @group Grid - Operations related to starmap grid
 * @param {integer} id.path.required - id of the grid
 * @returns {Grid.model} 200 - Data of a grid with given id
 */
router.get('/grid/:id', async (req, res) => {
	res.json(await Grid.forge({ id: req.params.id }).fetchWithRelated());
});

router.get('/object/:id', (req, res) => {
	const { id } = req.params;
	// TODO: Return data of the object with given ID
	const data = { id };
	res.json(data);
});

router.post('/object/:id', (req, res) => {
	const { id } = req.params;
	const { action } = req.body;
	switch (action) {
		case 'SEND_PROBE': {
			// TODO: Probe logic, send probe to the object with given ID
			break;
		}
		default: {
			// TODO: Error message if action is unknown
		}
	}
	// TODO: Return output of the given action
	const data = { id };
	res.json(data);
	req.io.to('starmap').emit('objectAction', data);
});

export default router;
