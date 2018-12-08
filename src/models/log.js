import Bookshelf from '../../db';

/* eslint-disable object-shorthand */

/**
 * @typedef {object} LogEntry
 * @property {integer} id.required - Log Entry ID
 * @property {string} ship_id - Ship ID
 * @property {string} message.required - Human readable log message
 * @property {object} metadata - JSON formatted metadata related to the log entry
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const LogEntry = Bookshelf.Model.extend({
	tableName: 'ship_log',
	hasTimestamps: true,
});
