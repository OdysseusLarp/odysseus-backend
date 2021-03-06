import Bookshelf from '../../db';

/**
 * @typedef Box
 * @property {string} id
 * @property {object} value.required - Any JSON data
 * @property {integer} version.required - Version number used for optimistic locking
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Box = Bookshelf.Model.extend({
	tableName: 'box',
	hasTimestamps: true
});

export const getBoxValueById = async id => {
	const box = await Box.forge({ id }).fetch();
	if (box) return box.get('value');
	return;
};
