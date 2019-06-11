import { Router } from 'express';
import { Ship, Grid, Beacon } from '../models/ship';
import { NotFound, Conflict } from 'http-errors';
import { handleAsyncErrors } from '../helpers';
const router = new Router();

/**
 * Get info of the grid where Odysseus is currently located including list of ships
 * @route GET /starmap/grid
 * @group Starmap - Operations related to starmap
 * @returns {Grid.model} 200 - Current grid data
 */
router.get('/grid', async (req, res) => {
	const odysseus = await Ship.forge({ id: 'odysseus' }).fetch();
	res.json(await Grid.forge({ id: odysseus.get('grid_id') }).fetchWithRelated());
});

/**
 * Get info of the grid with given id including list of ships
 * @route GET /starmap/grid/{id}
 * @group Starmap - Operations related to starmap
 * @param {integer} id.path.required - id of the grid
 * @returns {Grid.model} 200 - Data of a grid with given id
 */
router.get('/grid/:id', async (req, res) => {
	res.json(await Grid.forge({ id: req.params.id }).fetchWithRelated());
});

/**
 * Attempt to decode a signal
 * @route PUT /starmap/beacon/decode/{id}
 * @group Starmap - Operations related to starmap
 * @param {string} id.path.required - id of the beacon (also the signal decryption key)
 * @returns {object} 204 - OK
 */
router.put('/beacon/decode/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	const beacon = await Beacon.where({ id }).fetchWithRelated();
	if (!beacon) throw new NotFound(`No signal found using decryption key '${id}'`);
	if (beacon.get('is_decrypted')) throw new Conflict(`Signal has already been decrypted`);
	// Set this beacon as active, set others as inactive
	await beacon.activate();
	res.sendStatus(204);
}));

export default router;
