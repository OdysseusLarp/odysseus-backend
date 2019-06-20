import Bookshelf, { knex } from '../../db';
import { addShipLogEntry } from './log';
import { MapObject } from './map-object';
import { get, pick } from 'lodash';
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
	// Returns a random point around the grid centroid
	getRandomJumpTarget: function () {
		return knex.raw('SELECT ST_Translate(ST_Centroid(grid.the_geom), (SELECT FLOOR(RANDOM() * 300000 - 150000)), (SELECT FLOOR(RANDOM() * 300000 - 150000))) AS jump_target FROM grid WHERE grid.id = ?', this.get('id'))
			.then(res => get(res, 'rows[0].jump_target'));
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

/**
 * @typedef Beacon
 * @property {string} id - ID also acting as the signal decryption key
 * @property {integer} grid_id.required - Grid ID
 * @property {boolean} is_active.required - If the beacon is currently active or not
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Beacon = Bookshelf.Model.extend({
	tableName: 'starmap_beacon',
	hasTimestamps: true,
	grid: function () {
		return this.hasOne(Grid, 'id', 'grid_id');
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: ['grid'] });
	},
	activate: function () {
		// Set this beacon as active and others as inactive
		return knex.transaction(async trx =>
			Promise.all([
				knex('starmap_beacon')
					.transacting(trx)
					.update({ is_active: false })
					.whereNot('id', this.get('id')),
				knex('starmap_beacon')
					.transacting(trx)
					.update({ is_active: true, is_decrypted: true })
					.where('id', this.get('id'))
			]).then(() => trx.commit())
				.then(() => addShipLogEntry(
					'SUCCESS',
					`Successfully decrypted an unknown signal originating from area ${this.related('grid').get('name')}`,
					'odysseus',
					{ showPopup: true }
				))
				.then(() => getSocketIoClient().emit('refreshMap'))
				.catch(() => trx.rollback()));
	}
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
const SHIP_PRESENT_STATUS = 'Present and accounted for';

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
			const id = model.get('id');
			if (id !== 'odysseus') return;
			const io = getSocketIoClient();
			if (!io) {
				logger.warning('Could not emit shipUpdated when Odysseus ship model was updated');
				return;
			}
			const newShip = await Ship.forge({ id }).fetchWithRelated({ withGeometry: true });
			io.emit('shipUpdated', newShip);
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
		return this.orderBy('id').fetchAll({
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
	},
	jumpFleet: async function ({ grid_id, metadata, the_geom }) {
		// Jump rest of the fleet first
		await Bookshelf.knex.raw(
			`UPDATE ship SET grid_id = ?, the_geom = ?, updated_at = NOW() WHERE is_visible = TRUE AND status = ?`,
			[
				grid_id,
				the_geom,
				SHIP_PRESENT_STATUS
			]
		);

		// Jump odysseus separately to trigger updated hook
		return this.save({ grid_id, metadata, the_geom }, { patch: true });
	},
	moveTo: async function (grid_id, the_geom) {
		return this.save({ grid_id, the_geom }, { patch: true });
	}
});

export const Ships = Bookshelf.Collection.extend({
	model: Ship
});

export function setShipsVisible() {
	return Bookshelf.knex.raw(`UPDATE ship SET is_visible = true`).then(() => {
		getSocketIoClient().emit('refreshMap');
	});
}

/**
 * @typedef MoveShipsInput
 * @property {Array.<string>} shipIds.required - IDs of the ships that should be moved
 * @property {JumpTargetInput.model} jumpTarget.required - Jump target data
 */

/**
 * @typedef JumpTargetInput
 * @property {string} sub_quadrant.required - Grid sub_quadrant, e.g. Alpha-6
 * @property {string} sector.required - Grid sector, e.g. C3
 * @property {string} sub_sector.required - Grid sub_sector, e.g. 70
 * @property {string} planet_orbit - name_generated of the target planet, e.g. P-CO79-MR75
 */

/**
 * Move multiple ships to given coordinates
 * @param {Array.<string>} shipIds Array of Ship IDs that should be moved
 * @param {object} coordinates Target coordinates from jump state
 */
export async function moveShips(shipIds, coordinates) {
	const jumpTargetParameters = pick(coordinates, ['sub_quadrant', 'sector', 'sub_sector']);
	const targetPlanetName = get(coordinates, 'planet_orbit');
	const promises = [
		Ships.forge().query(qb => qb.where('id', 'IN', shipIds)).fetch(),
		Grid.forge().where(jumpTargetParameters).fetch()
	];
	if (targetPlanetName) promises.push(MapObject.forge().where({ name_generated: targetPlanetName }).fetch());
	const [ships, grid, targetPlanet] = await Promise.all(promises);
	let targetGeometry;
	if (targetPlanet) targetGeometry = targetPlanet.get('the_geom');
	else targetGeometry = await grid.getRandomJumpTarget();
	const gridId = grid ? grid.get('id') : null;
	if (!targetGeometry) logger.error('Could not calculate new geometry for ships when moving to grid', gridId);
	await Promise.all([ships.map(ship => ship.moveTo(gridId, targetGeometry))]);
	logger.success(`Moved ships ${shipIds.join(', ')} to grid ${gridId}`);
	getSocketIoClient().emit('refreshMap');
}
