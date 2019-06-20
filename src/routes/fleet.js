import { Router } from 'express';
import { Ship, setShipsVisible } from '../models/ship';
import { handleAsyncErrors } from '../helpers';
import { validateJumpTarget } from '../eventhandler';
import { get, set, clone } from 'lodash';
const router = new Router();

/**
 * Get a list of all ships in the fleet. Contains current location of ships.
 * @route GET /fleet
 * @group Fleet - Fleet and ship related operations
 * @param {boolean} show_hidden.query - Should hidden ships be shown
 * @returns {Array.<Ship>} 200 - List of all ships in the fleet
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const showHidden = get(req.query, 'show_hidden') === 'true';
	const params = {};
	if (!showHidden) params.is_visible = true;
	res.json(await Ship.where(params).fetchAllWithRelated({ withGeometry: true }));
}));

/**
 * Get a specific ship by ship id. Contains current location of ship.
 * @route GET /fleet/{id}
 * @group Fleet - Fleet and ship related operations
 * @param {string} id.path.required - Ship id
 * @returns {Ship.model} 200 - Specific ship
 */
router.get('/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Ship.forge({ id: req.params.id }).fetchWithRelated({ withGeometry: true }));
}));

/**
 * Set is_visible=true for all ships
 * @route PUT /fleet/set-visible
 * @consumes application/json
 * @group Fleet - Fleet and ship related operations
 * @returns {object} 204 - OK Empty Response
 */
router.put('/set-visible', handleAsyncErrors(async (req, res) => {
	await setShipsVisible();
	res.sendStatus(204);
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
	await ship.save(req.body, { method: 'update', patch: true });
	res.json(await Ship.forge({ id }).fetchWithRelated({ withGeometry: true }));
}));

/**
 * Patch ship metadata by ship id. Only allows setting a value to a single key inside the ship metadata object.
 * @route PATCH /fleet/{id}/metadata
 * @consumes application/json
 * @group Fleet - Fleet and ship related operations
 * @param {string} id.path.required - Ship id
 * @param {string} key_path.body.required - Path to the key inside metadata object
 * @param {string} value.body.required - Value to set
 * @returns {string} 204 - OK Empty Response
 */
router.patch('/:id/metadata', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	const { key_path, value } = req.body;
	if (!key_path || value === undefined) throw new Error('key_path or value not found in req body');
	const ship = await Ship.forge({ id }).fetch();
	if (!ship) throw new Error('Ship not found');
	const metadata = clone(ship.get('metadata') || {});
	set(metadata, key_path, value);
	await ship.save({ metadata }, { method: 'update', patch: true });
	res.sendStatus(204);
}));

/**
 * Validate jump coordinates
 * @route POST /fleet/{id}/jump/validate
 * @consumes application/json
 * @group Fleet - Fleet and ship related operations
 * @param {string} id.path.required - Ship id
 * @param {object} jump_details.body.required - Ship object fields to be updated
 * @returns {object} 200 - Info if jump can be made or not
 */
router.post('/:id/jump/validate', handleAsyncErrors(async (req, res) =>
	res.json(await validateJumpTarget(req.params.id, req.body))));

export default router;
