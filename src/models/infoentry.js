import Bookshelf from '../../db';

/* eslint-disable object-shorthand */

/**
 * @typedef {object} InfoEntry
 * @property {integer} id.required - ID
 * @property {integer} priority.required - Priority of the entry in display sequence
 * @property {boolean} enabled.required - Enable the entry in display sequence
 * @property {string} title.required - Title of the entry
 * @property {string} body.required - Body of the entry, may contain HTML
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const InfoEntry = Bookshelf.Model.extend({
	tableName: 'infoboard_entry',
	hasTimestamps: true
});

