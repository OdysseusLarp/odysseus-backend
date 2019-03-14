import Bookshelf, { knex } from '../../db';
import { get } from 'lodash';

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
	},
	// Returns grid centroid as geometry, used when getting a new geometry for the ship during jump
	getCenter: function () {
		return knex.raw('SELECT ST_Centroid(grid.the_geom) AS center FROM grid WHERE id = ?', this.get('id'))
			.then(res => get(res, 'rows[0].center'));
	},
	// Check if a starmap_object with given name_generated is located within this grid's geometry
	containsObject(nameGenerated) {
		return knex.raw(
			`SELECT ST_WITHIN(
				(SELECT the_geom FROM starmap_object WHERE name_generated = ? AND celestial_body != 'star'), the_geom) AS has_object
				FROM grid WHERE id = ?`,
			[nameGenerated, this.get('id')])
			.then(res => get(res, 'rows[0].has_object'));
	}
});

/**
 * @typedef {object} GridAction
 * @property {string} id.required - ID
 * @property {string} grid_id.required - Grid ID
 * @property {string} ship_id.required - Ship ID
 * @property {string} type - Event type (SCAN, JUMP...)
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const GridAction = Bookshelf.Model.extend({
	tableName: 'grid_action',
	hasTimestamps: true
});

const shipWithRelated = [
	'position',
	// 'persons'
];

// Add 'geom' column that contains 'the_geom' parsed as GeoJSON so that it is
// easier to work with in OpenLayers (starmap)
function getColumns(withGeometry) {
	if (!withGeometry) return;
	return ['ship.*', knex.raw(`ST_AsGeoJSON(ship.the_geom)::jsonb AS geom`)];
}

/**
 * @typedef {object} Ship
 * @property {string} id.required - ID
 * @property {string} name.required - Name
 * @property {string} status.required - Status
 * @property {object} game_state - JSON representation of EmptyEpsilon state
 * @property {object} metadata - Ship metadata
 * @property {integer} grid_id - ID of the grid the ship is currently located in
 * @property {string} type - Ship type like MILITARY, CARGO, RESEARCH etc.
 * @property {string} class - Ship class
 * @property {string} the_geom - Position of the ship as a geometry point in EPSG:3857 projection
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Ship = Bookshelf.Model.extend({
	tableName: 'ship',
	hasTimestamps: true,
	position: function () {
		return this.hasOne(Grid, 'id', 'grid_id');
	},
	fetchAllWithRelated: function ({ withGeometry = false } = {}) {
		const columns = getColumns(withGeometry);
		return this.fetchAll({ withRelated: shipWithRelated, columns });
	},
	fetchWithRelated: function ({ withGeometry = false } = {}) {
		const columns = getColumns(withGeometry);
		return this.fetch({ withRelated: shipWithRelated, columns });
	},
	getGrid: function () {
		return this.related('position');
	}
});

