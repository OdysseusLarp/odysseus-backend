import { Router } from 'express';
import { Ship } from '../models/ship';
import { handleAsyncErrors } from '../helpers';
const router = new Router();

/**
 * Get a list of all ships in the fleet. Contains current location of ships.
 * @route GET /fleet
 * @group Fleet - Fleet and ship related operations
 * @returns {Array.<Ship>} 200 - List of all ships in the fleet
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	res.json(await Ship.forge().fetchAllWithRelated());
}));

/**
 * Get a specific ship by ship id. Contains current location of ship.
 * @route GET /fleet/{id}
 * @group Fleet - Fleet and ship related operations
 * @param {string} id.path.required - Ship id
 * @returns {Ship.model} 200 - Specific ship
 */
router.get('/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Ship.forge({ id: req.params.id }).fetchWithRelated());
}));

/**
 * Update ship by id
 * @route PUT /fleet/{id}
 * @consumes application/json
 * @group Fleet - Fleet and ship related operations
 * @param {string} id.path.required - Ship id
 * @param {Ship.model} ship.body.required - Ship object fields to be updated
 * @returns {Ship.model} 200 - Updated Ship values
 */
router.put('/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	// TODO: Validate input
	const ship = await Ship.forge({ id }).fetch();
	if (!ship) throw new Error('Ship not found');
	await ship.save(req.body, { method: 'update' });
	req.io.to('fleet').emit('shipUpdated', ship);
	res.json(await ship.fetchWithRelated());
}));

router.get('/:id/population', (req, res) => {
	const { id } = req.params;
	// TODO: Reply with current population of the ship with the given ID
	// Might not be needed as this can be just included in the /ship/:id route response
	res.json({ id });
});

export default router;
