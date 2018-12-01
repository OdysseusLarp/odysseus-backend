import { Router } from 'express';
import { Event } from '../models/event';
import { addEvent, updateEvent } from '../eventhandler';
import { handleAsyncErrors } from '../helpers';
const router = new Router();

/**
 * Get a list of all events
 * @route GET /event
 * @group Event - Ship event related operations
 * @returns {Array.<Event>} 200 - List of all events
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	res.json(await Event.forge().fetchAll());
}));

/**
 * Get a specific event by id
 * @route GET /event/{id}
 * @group Event - Ship event related operations
 * @param {integer} id.path.required - Event id
 * @returns {Event.model} 200 - Specific Event
 */
router.get('/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Event.forge({ id: req.params.id }).fetch());
}));

/**
 * Update or insert event
 * @route PUT /event
 * @group Event - Ship event related operations
 * @param {Event.model} event.body.required - Event model to be updated or inserted
 * @returns {Event.model} 200 - Updated or inserted Event values
 */
router.put('/', handleAsyncErrors(async (req, res) => {
	const { id } = req.body;
	// TODO: Validate input
	let event;
	if (id) event = await Event.forge({ id }).fetch();
	if (!event) {
		event = await Event.forge().save(req.body, { method: 'insert' });
		addEvent(event);
		req.io.to('event').emit('eventAdded', event);
	} else {
		await event.save(req.body, { method: 'update' });
		updateEvent(event);
		req.io.to('event').emit('eventUpdated', event);
	}
	res.json(event);
}));

export default router;
