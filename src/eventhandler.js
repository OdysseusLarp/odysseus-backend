import moment from 'moment';
import { isEmpty } from 'lodash';
import { Event } from './models/event';
import { Ship } from './models/ship';
import { logger } from './logger';

const currentEvents = new Map();
const eventTimers = new Map();

/**
 * Loads active events from database on when application is initialized
 */
export function loadEvents() {
	Event.forge().where({ is_active: true }).fetchAll()
		.then(eventsCollection => {
			const events = eventsCollection.toArray();
			if (!isEmpty(events)) events.forEach(addEvent);
			else logger.info('No active events were found in database');
		});
}

/**
 * Adds event to event handler. Event will be passed to correct function for
 * processing depending on event type.
 * @param {Event.model} event model
 */
export function addEvent(event) {
	switch (event.get('type')) {
		case 'JUMP': {
			addJumpEvent(event);
			break;
		}
		default: {
			return logger.warn(`Unknown event type '${
				event.get('type')}' for event with id ${event.get('id')}`);
		}
	}
}

/**
 * Deletes event from event handler
 * @param {Event.model} event model
 */
export function deleteEvent(event) {
	const id = event.get('id');
	// Clear timer
	clearTimeout(eventTimers.get(id));
	// Delete event
	currentEvents.delete(event.get('id'));
	logger.success(`Deleted event ${id} of type ${event.get('type')}`);
}

/**
 * Updates event in event handler by first deleting and then adding it again
 * @param {Event.model} event model
 */
export function updateEvent(event) {
	logger.info(`Updating event ${event.get('id')}`);
	deleteEvent(event);
	addEvent(event);
}

/**
 * Performs cleanup after event has finished
 * @param {Event.model} event model
 */
async function finishEvent(event) {
	const id = event.get('id');
	// Clear timer if it for some reason exists
	clearTimeout(eventTimers.get(id));
	// Remove from map
	currentEvents.delete(id);
	// Set is_active to false in database
	await event.setActive(false);
}

/**
 * Processing function for new jump event
 * @param {Event.model} event model
 */
function addJumpEvent(event) {
	const id = event.get('id');
	const shipId = event.get('ship_id');
	const metadata = event.get('metadata');
	const occursIn = getTimeUntilEvent(event);
	if (occursIn < 0) return logger.error(`Event ${id} occurs in the past`);

	// Set timer to execute jump
	eventTimers.set(id, setTimeout(() => {
		performShipJump(shipId, metadata.grid);
		finishEvent(event);
	}, occursIn));

	currentEvents.set(event.get('id'), event);
}

/**
 * Updates event in event handler by first deleting and then adding it again
 * @param {Event.model} event model
 * @returns {number} Milliseconds until the event takes place
 */
function getTimeUntilEvent(event) {
	const occursAt = moment(event.get('occurs_at'));
	return occursAt.diff(moment());
}

/**
 * Jumps the ship to a new grid by setting grid_id of the ship to given value
 * @param {string} shipId
 * @param {number} gridId
 */
async function performShipJump(shipId, gridId) {
	const ship = await Ship.forge({ id: shipId }).fetch();
	await ship.save({ grid_id: gridId });
	// TODO: Emit Socket IO event
	logger.success(`${shipId} succesfully jumped to grid ${gridId}`);
}
