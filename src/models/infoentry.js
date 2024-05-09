import Bookshelf from '../../db';

/* eslint-disable object-shorthand */

/**
 * @typedef InfoEntry
 * @property {integer} id - ID
 * @property {integer} priority.required - Priority of the entry in display sequence
 * @property {boolean} enabled.required - Enable the entry in display sequence
 * @property {string} title.required - Title of the entry
 * @property {string} body.required - Body of the entry, may contain HTML
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 * @property {string} active_until - ISO 8601 String Date-time when infoentry will expire
 */
export const InfoEntry = Bookshelf.Model.extend({
	tableName: 'infoboard_entry',
	hasTimestamps: true
});

/**
* @typedef InfoPriority
* @property {integer} priority.required
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
*/
export const InfoPriority = Bookshelf.Model.extend({
	tableName: 'infoboard_priority',
	hasTimestamps: true
});

