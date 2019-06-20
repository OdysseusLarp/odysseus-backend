import Bookshelf from '../../db';
import { getSocketIoClient } from '../index';
import { logger } from '../logger';
import { Person } from './person';

/* eslint-disable object-shorthand */

/**
 * @typedef LogEntry
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

const auditLogWithRelated = ['person', 'hacker']
	.map(rel => ({ [rel]: qb => qb.column('id', 'first_name', 'last_name', 'is_character') }));

/**
 * @typedef AuditLogEntry
 * @property {integer} id - Log Entry ID
 * @property {string} person_id - Person ID
 * @property {string} hacker_id - Person ID of the hacker, if a hacker performed the login
 * @property {object} metadata - JSON formatted metadata related to the audit log entry
 * @property {string} type - Type like LOGIN, LOGOUT
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const AuditLogEntry = Bookshelf.Model.extend({
	tableName: 'audit_log',
	hasTimestamps: true,
	initialize() {
		this.on('created', model => {
			const hacker = model.get('hacker_id');
			const hacked = hacker ? `(Hacked by ${hacker})` : '';
			logger.success('New audit log entry', model.get('type'), 'by', model.get('person_id'), hacked ? hacked : '');
			getSocketIoClient().emit('auditLogEntryAdded', model);
		});
	},
	person: function () {
		return this.hasOne(Person, 'id', 'person_id');
	},
	hacker: function () {
		return this.hasOne(Person, 'id', 'hacker_id');
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: auditLogWithRelated });
	},
	fetchPageWithRelated: function (page) {
		return this.orderBy('created_at').fetchPage({
			pageSize: 50,
			page,
			withRelated: auditLogWithRelated
		});
	},
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
