import moment from 'moment';
import { isEmpty, pick, inRange, get, isInteger } from 'lodash';
import { Event } from './models/event';
import { Ship, Grid } from './models/ship';
import { MapObject } from './models/map-object';
import { logger } from './logger';

const currentEvents = new Map();
const eventTimers = new Map();
let io;

/**
 * Loads active events from database on when application is initialized
 * @param {Object} socketIo Socket IO instance
 */
export function loadEvents(socketIo) {
	io = socketIo;
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
export async function addEvent(event) {
	switch (event.get('type')) {
		case 'JUMP': {
			return addJumpEvent(event);
		}
		case 'SCAN_OBJECT': {
			return addScanObjectEvent(event);
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
 * @param {boolean} success boolean stating if the event succeeded or was canceled
 */
async function finishEvent(event, success = true) {
	const id = event.get('id');
	// Clear timer if it for some reason exists
	clearTimeout(eventTimers.get(id));
	// Remove from map
	currentEvents.delete(id);
	// Set is_active to false in database
	await event.setActive(false);
	// Emit to Socket IO clients
	io.emit('eventFinished', { success, event });
}

async function addScanObjectEvent(event) {
	const id = event.get('id');
	const objectId = get(event.get('metadata'), 'target');
	const occursIn = getTimeUntilEvent(event);
	if (occursIn < 0) throw new Error(`Event ${id} occurs in the past`);
	if (!isInteger(objectId)) throw new Error(`Event ${id} target object ID ${objectId} is invalid`);

	// TODO: Check if ship has probes left, remove 1 probe from state

	// Set timer to execute scan
	eventTimers.set(id, setTimeout(() => {
		performObjectScan(objectId);
		finishEvent(event);
	}, occursIn));
	currentEvents.set(event.get('id'), event);
}

/**
 * Processing function for new jump event
 * @param {Event.model} event model
 */
async function addJumpEvent(event) {
	const id = event.get('id');
	const shipId = event.get('ship_id');
	const metadata = event.get('metadata');
	const occursIn = getTimeUntilEvent(event);
	if (occursIn < 0) return logger.error(`Event ${id} occurs in the past`);

	// Get target grid and ship from database to validate if jump can be made
	// TODO: Include planet_orbit in query if it is set
	const jumpTargetParameters = pick(metadata, ['quadrant', 'sector', 'sub_sector']);
	const grid = await Grid.forge().where(jumpTargetParameters).fetch();
	if (!grid) throw new Error('Given grid does not exist');
	const ship = await Ship.forge({ id: shipId }).fetchWithRelated();
	if (!ship) throw new Error('Invalid ship id');
	if (!validateJumpRange(ship, grid)) throw new Error('Jump can not be made from current position');

	// Set timer to execute jump
	eventTimers.set(id, setTimeout(() => {
		performShipJump(shipId, grid.get('id'));
		finishEvent(event);
	}, occursIn));

	currentEvents.set(event.get('id'), event);
}

/**
 * Validate if ship can jump to a target grid or not
 * @param {Ship.model} ship Ship model
 * @param {Grid.model} targetGrid Grid model
 * @returns {boolean} Boolean stating if jump can be made or not
 */
function validateJumpRange(ship, targetGrid) {
	const jumpRange = get(ship.get('metadata'), 'jump_range', 1);
	const current = ship.related('position').getCoordinates();
	const target = targetGrid.getCoordinates();
	const min = { x: current.x - jumpRange, y: current.y - jumpRange };
	const max = { x: current.x + jumpRange + 1, y: current.x + jumpRange + 1 };
	return (
		inRange(target.x, min.x, max.x) &&
		inRange(target.y, min.y, max.y));
}

/**
 * Updates event in event handler by first deleting and then adding it again
 * @param {Event.model} event model
 * @returns {number} Milliseconds until the event takes place
 */
function getTimeUntilEvent(event) {
	// Human readable format for logging
	const occursIn = moment(event.get('occurs_at')).fromNow();
	logger.info(`${event.get('type')} event ${event.get('id')} will occur in`, occursIn);
	// Time until event in milliseconds
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
	// Reset jump range back to 1
	const metadata = { ...ship.get('metadata', {}), jump_range: 1 };
	await ship.save({ grid_id: gridId, metadata });
	logger.success(`${shipId} succesfully jumped to grid ${gridId}`);
}

async function performObjectScan(objectId) {
	const object = await MapObject.forge({ id: objectId }).fetch();
	await object.save({ is_scanned: true });
	logger.success(`Object ${objectId} was succesfully scanned`);
}
