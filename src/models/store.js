import Bookshelf from '../../db';

/**
 * @typedef Store
 * @property {string} id.required
 * @property {object} data.required - JSON Data
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Store = Bookshelf.Model.extend({
	tableName: 'store',
	hasTimestamps: true
});
