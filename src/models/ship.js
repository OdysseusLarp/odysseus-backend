import Bookshelf from '../../db';

/* eslint-disable object-shorthand */

/**
 * @typedef Grid
 * @property {string} id.required - ID
 * @property {string} name.required - Name
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Grid = Bookshelf.Model.extend({
	tableName: 'grid',
	hasTimestamps: true,
});

const withRelated = [
	'position',
	// 'persons'
];

/**
 * @typedef Ship
 * @property {string} id.required - ID
 * @property {string} name.required - Name
 * @property {string} status.required - Status
 * @property {object} game_state - JSON representation of EmptyEpsilon state
 * @property {integer} grid_id - ID of the grid the ship is currently located in
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Ship = Bookshelf.Model.extend({
	tableName: 'ship',
	hasTimestamps: true,
	position: function () {
		return this.hasOne(Grid, 'id', 'grid_id');
	},
	fetchAllWithRelated: function () {
		return this.fetchAll({ withRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated });
	}
});

