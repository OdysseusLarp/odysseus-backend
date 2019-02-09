import Bookshelf from '../../db';

/* eslint-disable object-shorthand */

const shipWithRelated = [

];

/**
 * @typedef {object} MapObject
 * @property {string} id.required - ID
 * @property {string} the_geom - Position of the ship as a geometry point in EPSG:3857 projection
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const MapObject = Bookshelf.Model.extend({
	tableName: 'starmap_object',
	// enable timestamps in migrations?
	// hasTimestamps: true,
	fetchAllWithRelated: function () {
		return this.fetchAll({ withRelated: shipWithRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: shipWithRelated });
	},
});

