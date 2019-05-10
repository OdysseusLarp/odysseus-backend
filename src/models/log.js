import Bookshelf from '../../db';
import { getSocketIoClient } from '../index';
import { logger } from '../logger';

/* eslint-disable object-shorthand */

/**
 * @typedef {object} LogEntry
 * @property {integer} id - Log Entry ID
 * @property {string} ship_id - Ship ID
 * @property {string} message.required - Human readable log message
 * @property {object} metadata - JSON formatted metadata related to the log entry
 * @property {string} type - Type like SUCCESS, ALERT, WARNING, INFO used for styling and filtering
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const LogEntry = Bookshelf.Model.extend({
	tableName: 'ship_log',
	hasTimestamps: true,
	initialize() {
		// Emit during 'destroying' instead of 'destroyed' since 'destroyed' event
		// no longer has access to the model id
		this.on('destroying', model => {
			logger.success('Deleted log entry', model.get('id'), model.get('type'), model.get('message'));
			getSocketIoClient().emit('logEntryDeleted', { id: model.get('id') });
		});
		this.on('created', model => {
			logger.success('Created new log entry', model.get('id'), model.get('type'), model.get('message'));
			getSocketIoClient().emit('logEntryAdded', model);
		});
		this.on('updated', model => {
			logger.success('Updated log entry', model.get('id'), model.get('type'), model.get('message'));
			getSocketIoClient().emit('logEntryUpdated', model);
		});
	}
});

/** Adds log entry to database and emits it via Socket.IO
 * @param  {string} type INFO, SUCCESS, WARNING, ERROR
 * @param  {string} message Message
 * @param  {string} shipId='odysseus' Ship ID
 * @param  {object} metadata=null Any metadata
 */
export async function addShipLogEntry(type, message, shipId = 'odysseus', metadata = null) {
	const body = {
		ship_id: shipId,
		message,
		metadata,
		type
	};
	await LogEntry.forge().save(body, { method: 'insert' });
}

export const shipLogger = {
	info: (message, metadata = null) => addShipLogEntry('INFO', message, 'odysseus', metadata),
	success: (message, metadata = null) => addShipLogEntry('SUCCESS', message, 'odysseus', metadata),
	warning: (message, metadata = null) => addShipLogEntry('WARNING', message, 'odysseus', metadata),
	error: (message, metadata = null) => addShipLogEntry('ERROR', message, 'odysseus', metadata)
};
