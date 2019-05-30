import Bookshelf, { knex } from '../../db';
import { get } from 'lodash';
import { getSocketIoClient } from '../index';
import { logger } from '../logger';
import { Person } from './person';

/* eslint-disable object-shorthand */

/**
 * @typedef Grid
 * @property {string} id - ID
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
 * @typedef GridAction
 * @property {string} id - ID
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

const PERSON_IS_ALIVE_STATUS = 'Present and accounted for';

/**
 * @typedef Ship
 * @property {string} id.required - ID
 * @property {string} name.required - Name
 * @property {string} status.required - Status
 * @property {integer} transporter_count - Transporter count
 * @property {integer} fighter_count - Fighter count
 * @property {object} metadata - Ship metadata
 * @property {boolean} is_visible - Has the ship been discovered yet
 * @property {integer} grid_id - ID of the grid the ship is currently located in
 * @property {integer} person_count - Number of visible persons with 'Present and accounted for' status aboard the ship
 * @property {string} type - Ship type like MILITARY, CARGO, RESEARCH etc.
 * @property {string} class - Ship class
 * @property {string} the_geom - Position of the ship as a geometry point in EPSG:3857 projection
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Ship = Bookshelf.Model.extend({
	tableName: 'ship',
	hasTimestamps: true,
	initialize() {
		// Emit new ship model to Socket.IO clients after Odysseus data is updated
		this.on('updated', async model => {
			if (model.get('id') !== 'odysseus') return;
			const io = getSocketIoClient();
			if (!io) {
				logger.warning('Could not emit shipUpdated when Odysseus ship model was updated');
				return;
			}
			io.emit('shipUpdated', await model.fetchWithRelated({ withGeometry: true }));
		});
		this.on('fetching fetching:collection', (model, columns, options) => {
			options.query.select(knex.raw(
				`(SELECT COUNT(*) FROM person WHERE person.ship_id = ship.id AND person.is_visible IS TRUE AND person.status = ?) AS person_count`,
				[PERSON_IS_ALIVE_STATUS]
			));
		});
		this.on('saving', (model, columns, options) => {
			// Unset person_count before updating the model, as the column
			// does not exist
			if (model.get('person_count')) model.unset('person_count');
		});
	},
	position: function () {
		return this.hasOne(Grid, 'id', 'grid_id');
	},
	persons: function () {
		return this.hasMany(Person);
	},
	fetchAllWithRelated: function ({ withGeometry = false } = {}) {
		const columns = getColumns(withGeometry);
		return this.orderBy('name').fetchAll({
			withRelated: shipWithRelated,
			columns
		});
	},
	fetchWithRelated: function ({ withGeometry = false } = {}) {
		const columns = getColumns(withGeometry);
		return this.fetch({ withRelated: shipWithRelated, columns });
	},
	getGrid: function () {
		return this.related('position');
	}
});

