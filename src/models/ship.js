import Bookshelf from '../../db';

/* eslint-disable object-shorthand */

/**
 * @typedef {object} Grid
 * @property {string} id.required - ID
 * @property {string} name.required - Name
 * @property {integer} zoom - Zoom level
 * @property {string} quadrant - Quadrant of the grid. Map is made of 16 quadrants.
 * @property {string} sector - Sector of the grid. Map is made of 81 sectors.
 * @property {string} sub_sector - Sub-sector of the grid. Map has 256 subsectors.
 * @property {integer} x - Location of the sector on x-axis to help selecting nearby grids
 * @property {integer} y - Location of the sector on y-axis to help selecting nearby grids
 * @property {string} the_geom - Actual geometry of the grid in EPSG:3857 projection
 */
export const Grid = Bookshelf.Model.extend({
	tableName: 'grid',
	hasTimestamps: true,
	ships: function () {
		return this.hasMany(Ship);
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: ['ships'] });
	},
	getCoordinates: function () {
		return { x: this.get('x'), y: this.get('y') };
	}
});

const shipWithRelated = [
	'position',
	// 'persons'
];

/**
 * @typedef {object} Ship
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
		return this.fetchAll({ withRelated: shipWithRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: shipWithRelated });
	},
	getGrid: function () {
		return this.related('position');
	}
});

