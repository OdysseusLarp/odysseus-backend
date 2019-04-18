import moment from 'moment';
import { isEmpty, pick, inRange, get, isInteger } from 'lodash';
import { Event } from './models/event';
import { Ship, Grid, GridAction } from './models/ship';
import { LogEntry } from './models/log';
import { MapObject } from './models/map-object';
import { logger } from './logger';

const currentEvents = new Map();
const eventTimers = new Map();
const LOW_PROBE_COUNT_WARNING_LIMIT = 3;
let io;

/** Adds log entry to database and emits it via Socket.IO
 * @param  {string} type INFO, SUCCESS, WARNING, ERROR
 * @param  {string} message Message
 * @param  {string} shipId='odysseus' Ship ID
 * @param  {object} metadata=null Any metadata
 */
async function addLogEntry(type, message, shipId = 'odysseus', metadata = null) {
	const body = {
		ship_id: shipId,
		message,
		metadata,
		type
	};
	const logEntry = await LogEntry.forge().save(body, { method: 'insert' });
	io.emit('logEntryAdded', logEntry);
}

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
		case 'JUMP': {
			return addJumpEvent(event);
		}
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
	addLogEntry(
		'INFO',
		`Scanning initiated on space object ${object.get('name_generated')}.`
	);
}

async function addScanGridEvent(event) {
	const id = event.get('id');
	const gridId = get(event.get('metadata'), 'target');
	const occursIn = getTimeUntilEvent(event);
	const shipId = event.get('ship_id');

	// Get target grid and ship from database to validate if scan can be made
	const grid = await Grid.forge({ id: gridId }).fetch();
	if (!grid) throw new Error('Given grid does not exist');
	const ship = await Ship.forge({ id: shipId }).fetchWithRelated();
	if (!ship) throw new Error('Invalid ship id');
	const probeCount = get(ship.get('metadata'), 'probe_count');
	if (!isInteger(probeCount)) throw new Error('Probe count is unavailable');
	if (probeCount < 1) throw new Error('No probes available');
	if (!validateRange(ship, grid, 'scan_range')) throw new Error('Scan can not be made from current position');
	if (occursIn < 0) throw new Error(`Event ${id} occurs in the past`);
	if (!isInteger(gridId)) throw new Error(`Event ${id} target object ID ${gridId} is invalid`);

	// Remove 1 probe from Odysseus if that has not been done for this scan yet
	const shipMetadata = ship.get('metadata');
	const newProbeCount = probeCount - 1;
	ship.save(
		{ metadata: { ...shipMetadata, probe_count: newProbeCount } },
		{ type: 'update', patch: true })
		.then(() => {
			logger.info(`Decreased probe count by 1 because of grid scan`);
			let probeWarningMessage;
			if (newProbeCount === 0) {
				probeWarningMessage = `No probes left.`;
			} else if (newProbeCount < LOW_PROBE_COUNT_WARNING_LIMIT) {
				probeWarningMessage = `Probe count is low (${newProbeCount} pcs).`;
			}
			if (probeWarningMessage) addLogEntry('WARNING', probeWarningMessage);
			emitShipUpdated();
		});

	// Set timer to execute scan
	eventTimers.set(id, setTimeout(() => {
		performGridScan(gridId);
		finishEvent(event);
	}, occursIn));
	currentEvents.set(event.get('id'), event);
	const gridName = grid.get('name');
	addLogEntry(
		'INFO',
		`Probe was sent to scan grid ${gridName}.`
	);
}
/** Validate jump target coordinates
 * @param  {string} shipId Ship id
 * @param  {object} metadata Jump coordinates and settings
 */
export async function validateJumpTarget(shipId, metadata) {
	// Get target grid and ship from database to validate if jump can be made
	const jumpTargetParameters = pick(metadata, ['sub_quadrant', 'sector', 'sub_sector']);
	const targetPlanetName = get(metadata, 'planet_orbit');
	const grid = await Grid.forge().where(jumpTargetParameters).fetch();
	const shouldAddLogEntries = get(metadata, 'should_add_log_entries', true);
	if (!grid) {
		if (shouldAddLogEntries) addLogEntry('ERROR', `Jump initialization failed: Unknown jump target.`, shipId);
		return { isValid: false, message: 'Given grid does not exist' };
	}
	if (targetPlanetName && !(await grid.containsObject(targetPlanetName))) {
		if (shouldAddLogEntries) addLogEntry('ERROR',
			`Jump initialization failed: Given orbit not found in target sub-sector.`, shipId);
		return { isValid: false, message: 'Given planet not found in target grid' };
	}
	const ship = await Ship.forge({ id: shipId }).fetchWithRelated();
	if (!ship) throw new Error('Invalid ship id');
	if (!validateRange(ship, grid, 'jump_range')) {
		if (shouldAddLogEntries) addLogEntry('ERROR',
			`Jump initialization failed: Target coordinates too far away.`, shipId);
		return { isValid: false, message: 'Jump can not be made from current position' };
	}
	return { isValid: true };
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

	const jumpValidationData = await validateJumpTarget(shipId, metadata);
	if (!jumpValidationData.isValid) throw new Error(jumpValidationData.message);

	const jumpTargetParameters = pick(metadata, ['sub_quadrant', 'sector', 'sub_sector']);
	const targetPlanetName = get(metadata, 'planet_orbit');
	const grid = await Grid.forge().where(jumpTargetParameters).fetch();

	// Set timer to execute jump
	eventTimers.set(id, setTimeout(async () => {
		await performShipJump(shipId, grid.get('id'), targetPlanetName);
		finishEvent(event);
	}, occursIn));

	currentEvents.set(event.get('id'), event);
	const gridName = grid.get('name');
	addLogEntry(
		'INFO',
		`Odysseus initiated a jump to grid ${gridName}.`,
		shipId
	);
}

/**
 * Validate if ship can scan or jump to a target grid
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
 * @param {string} shipId Ship ID
 * @param {number} gridId Target grid ID
 * @param {string} targetPlanetName name_generated of target planet if jumping to orbit
 */
async function performShipJump(shipId, gridId, targetPlanetName) {
	const promises = [
		Ship.forge({ id: shipId }).fetch(),
		Grid.forge({ id: gridId }).fetch()
	];
	if (targetPlanetName) promises.push(MapObject.forge({ name_generated: targetPlanetName }).fetch());
	const [ship, grid, targetPlanet] = await Promise.all(promises);
	let targetGeometry;
	if (targetPlanet) targetGeometry = targetPlanet.get('the_geom');
	else targetGeometry = await grid.getCenter();
	if (!targetGeometry) logger.error('Could not calculate new geometry for ship when jumping to grid', gridId);
	// Reset jump range back to 1
	const metadata = { ...ship.get('metadata', {}), jump_range: 1 };
	await Promise.all([
		ship.save({ grid_id: gridId, metadata, the_geom: targetGeometry }),
		GridAction.forge().save({ grid_id: gridId, ship_id: shipId, type: 'JUMP' })
	]);
	logger.success(`${shipId} succesfully jumped to grid ${gridId}`);
	const gridName = grid.get('name');
	addLogEntry(
		'SUCCESS',
		`Odysseus completed the jump to grid ${gridName}.`,
		shipId
	);
	emitShipUpdated();
}

async function performObjectScan(objectId) {
	const object = await MapObject.forge({ id: objectId }).fetch();
	await object.save({ is_scanned: true });
	logger.success(`Object ${objectId} was succesfully scanned`);
	const objectName = object.get('name_generated');
	addLogEntry(
		'SUCCESS',
		`Space object ${objectName} was scanned.`
	);
}

async function performGridScan(gridId) {
	await GridAction.forge().save({ grid_id: gridId, ship_id: 'odysseus', type: 'SCAN' });
	const grid = await Grid.forge({ id: gridId }).fetch();
	logger.success(`Grid ${gridId} was succesfully scanned`);
	const gridName = grid.get('name');
	addLogEntry(
		'SUCCESS',
		`Probe finished scanning grid ${gridName}.`
	);
}

async function emitShipUpdated(ship = null) {
	io.emit('shipUpdated',
		ship ||
		await Ship.forge({ id: 'odysseus' })
			.fetchWithRelated({ withGeometry: true }));
}
