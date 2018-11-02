import Bookshelf from '../../db';

/**
 * @typedef Box
 * @property {integer} id.required
 * @property {object} value.required - Any JSON data
 * @property {integer} version.required - Version number used for optimistic locking
 * @property {date} created_at
 * @property {date} updated_at
 */
export const Box = Bookshelf.Model.extend({
	tableName: 'box',
	hasTimestamps: true
});
