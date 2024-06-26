import moment from 'moment';
import { isEmpty, pick, inRange, get, isInteger } from 'lodash';
import { Event } from './models/event';
import { Ship, Grid, GridAction } from './models/ship';
import { addShipLogEntry } from './models/log';
import { MapObject } from './models/map-object';
import { logger } from './logger';
import * as dmx from './dmx';

const currentEvents = new Map();
const eventTimers = new Map();
const LOW_PROBE_COUNT_WARNING_LIMIT = 3;
let io;

/**
 * Loads active events from database on when application is initialized
 * @param {object} socketIo Socket IO instance
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
		case 'SCAN_OBJECT': {
			return addScanObjectEvent(event);
		}
		case 'SCAN_GRID': {
			return addScanGridEvent(event);
		}
		default: {
			throw new Error(`Unknown event type '${
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
	const object = await MapObject.forge({ id: objectId }).fetch();
	addShipLogEntry(
		'INFO',
		`Scanning initiated on space object ${object.get('name_generated')}.`
	);
}

async function addScanGridEvent(event) {
	const id = event.get('id');
	const gridId = get(event.get('metadata'), 'target');
	const occursIn = getTimeUntilEvent(event);
	const shipId = event.get('ship_id');

	// Get target grid (sub-sector) and ship from database to validate if scan can be made
	const grid = await Grid.forge({ id: gridId }).fetch();
	if (!grid) throw new Error('Given sub-sector does not exist');
	const ship = await Ship.forge({ id: shipId }).fetchWithRelated();
	if (!ship) throw new Error('Invalid ship id');
	const probeCount = get(ship.get('metadata'), 'probe_count');
	if (!isInteger(probeCount)) throw new Error('Probe count is unavailable');
	if (probeCount < 1) throw new Error('No probes available');
	if (!validateRange(ship, grid, 'scan_range')) throw new Error('Scan can not be made from current position');
	if (occursIn < 0) throw new Error(`Event ${id} occurs in the past`);
	if (!isInteger(gridId)) throw new Error(`Event ${id} target object ID ${gridId} is invalid`);


	dmx.fireEvent(dmx.CHANNELS.LoraGridScanInitiated);

	// Remove 1 probe from Odysseus if that has not been done for this scan yet
	const shipMetadata = ship.get('metadata');
	const newProbeCount = probeCount - 1;
	ship.save(
		{ metadata: { ...shipMetadata, probe_count: newProbeCount } },
		{ type: 'update', patch: true })
		.then(() => {
			logger.info(`Decreased probe count by 1 because of sub-sector scan`);
			let probeWarningMessage;
			if (newProbeCount === 0) {
				probeWarningMessage = `No probes left.`;
			} else if (newProbeCount < LOW_PROBE_COUNT_WARNING_LIMIT) {
				probeWarningMessage = `Probe count is low (${newProbeCount} pcs).`;
			}
			if (probeWarningMessage) addShipLogEntry('WARNING', probeWarningMessage);
		});

	// Set timer to execute scan
	eventTimers.set(id, setTimeout(() => {
		performGridScan(gridId);
		finishEvent(event);
	}, occursIn));
	currentEvents.set(event.get('id'), event);
	const gridName = grid.get('name');
	addShipLogEntry(
		'INFO',
		`Probe was sent to scan grid ${gridName}.`
	);
}
/** Validate jump target coordinates
 * @param  {string} shipId Ship id
 * @param  {object} metadata Jump coordinates and settings
 * @param  {boolean} shouldValidateRange Should distance to grid (sub-sector) be validated or not
 */
export async function validateJumpTarget(shipId, metadata, shouldValidateRange = true) {
	// Get target grid (sub-sector) and ship from database to validate if jump can be made
	const jumpTargetParameters = pick(metadata, ['sub_quadrant', 'sector', 'sub_sector']);
	const targetPlanetName = get(metadata, 'planet_orbit');
	const grid = await Grid.forge().where(jumpTargetParameters).fetch();
	const shouldAddLogEntries = get(metadata, 'should_add_log_entries', false);
	if (!grid) {
		if (shouldAddLogEntries) addShipLogEntry('ERROR', `Jump initialization failed: Unknown jump target.`, shipId);
		return { isValid: false, message: 'Given sub-sector does not exist' };
	}
	if (targetPlanetName && !(await grid.containsObject(targetPlanetName))) {
		if (shouldAddLogEntries) addShipLogEntry('ERROR',
			`Jump initialization failed: Given orbit not found in target sub-sector or the orbit is too close to a sun or black hole.`, shipId);
		if (targetPlanetName.startsWith("S"))
			return { isValid: false, message: 'Orbit is too close to a star' }
		if (targetPlanetName.startsWith("B"))
			return { isValid: false, message: 'Orbit is too close to a black hole' }
		return { isValid: false, message: 'Given orbit not found in target sub-sector' };
	}
	const ship = await Ship.forge({ id: shipId }).fetchWithRelated();
	if (!ship) throw new Error('Invalid ship id');
	if (shouldValidateRange && !validateRange(ship, grid, 'jump_range')) {
		if (shouldAddLogEntries) addShipLogEntry('ERROR',
			`Jump initialization failed: Target coordinates too far away.`, shipId);
		return { isValid: false, message: 'Jump can not be made from current position' };
	}
	return { isValid: true };
}

/**
 * Validate if ship can scan or jump to a target grid (sub-sector)
 * @param {Ship.model} ship Ship model
 * @param {Grid.model} targetGrid Grid model
 * @param {string} rangeField either jump_range or scan_range
 * @returns {boolean} Boolean stating if jump can be made or not
 */
function validateRange(ship, targetGrid, rangeField = 'jump_range') {
	const jumpRange = get(ship.get('metadata'), rangeField, 1);
	const current = ship.related('position').getCoordinates();
	const target = targetGrid.getCoordinates();
	const min = { x: current.x - jumpRange, y: current.y - jumpRange };
	const max = { x: current.x + jumpRange + 1, y: current.y + jumpRange + 1 };
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

async function performObjectScan(objectId) {
	const object = await MapObject.forge({ id: objectId }).fetch();
	await object.save({ is_scanned: true });
	logger.success(`Object ${objectId} was succesfully scanned`);
	const objectName = object.get('name_generated');
	addShipLogEntry(
		'SUCCESS',
		`Space object ${objectName} was scanned.`
	);
}

async function performGridScan(gridId) {
	await GridAction.forge().save({ grid_id: gridId, ship_id: 'odysseus', type: 'SCAN' });
	const grid = await Grid.forge({ id: gridId }).fetch();
	dmx.fireEvent(dmx.CHANNELS.LoraGridScanCompleted);
	logger.success(`Sub-sector ${gridId} was succesfully scanned`);
	const gridName = grid.get('name');
	addShipLogEntry(
		'SUCCESS',
		`Probe finished scanning sub-sector ${gridName}.`
	);
}
