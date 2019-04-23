const csv = require('csvtojson');
const path = require('path');
const isEmpty = require('lodash').isEmpty;

// Read the grid from CSV and convert the columns to have correct types
async function getGrid() {
	const csvPath = path.join(__dirname, '../data/grid.csv');
	const grids = await csv().fromFile(csvPath);
	return grids.map(grid => {
		['quadrant', 'sector', 'sub_sector', 'sub_quadrant', 'name'].forEach(col => {
			if (!grid[col]) delete grid[col];
		});
		['id', 'zoom', 'x', 'y'].forEach(col => {
			if (isEmpty(grid[col])) grid[col] = null;
			else grid[col] = Number(grid[col]);
		});
		return grid;
	});
}

// Initial geometry for other fleet ships
/* eslint-disable-next-line camelcase */
const the_geom = '0101000020110F000000000000000000000000000000000000';

// Initial geometry for Odysseus (On top of A3 jump point, id 5401)
const odysseusGeom = '0101000020110F000071416E1D82344B4140FB654BF3CA51C1';

const ships = [
	{
		id: 'odysseus',
		name: 'Odysseus',
		status: 'OPERATIONAL',
		game_state: '{}',
		grid_id: 5254,
		the_geom: odysseusGeom,
		metadata: {
			jump_range: 1,
			scan_range: 1,
			probe_count: 100,
			jump_crystal_count: 100,
		},
		type: 'RESEARCH',
		class: 'FIREFLY'
	},
	{
		id: 'starcaller',
		name: 'Starcaller',
		status: 'OPERATIONAL',
		game_state: null,
		grid_id: 1500,
		the_geom,
		type: 'CIVILIAN',
		class: 'M2'
	},
	{
		id: 'dummy1',
		name: 'Dummy Ship 1',
		status: 'UNKNOWN',
		game_state: null,
		grid_id: 1500,
		the_geom,
		type: 'CARGO',
		class: 'C5'
	},
	{
		id: 'dummy2',
		name: 'Dummy Ship 2',
		status: 'UNKNOWN',
		game_state: null,
		grid_id: 1500,
		the_geom,
		type: 'MILITARY',
		class: 'C1'
	},
];

// Grids that are discovered from the beginning of the game
const discoveredGrids = [
	5236,
	5237,
	5238,
	5239,
	5252,
	5253,
	5254,
	5255,
	5268,
	5269,
	5270,
	5271,
	5285,
	5286,
	5287,
	5302,
	5303,
	5318,
	5319,
	5334,
	5350,
	5366
];

/* eslint-disable-next-line camelcase */
const gridActions = discoveredGrids.map(grid_id => ({ ship_id: 'odysseus', grid_id, type: 'SCAN' }));

// Persons aboard Odysseus
const personIds = ['1', '2', '3', '4', '5'];

exports.seed = async knex => {
	await knex('event').del();
	await knex('ship').del();
	await knex('grid').del();
	await knex('starmap_object').del();
	await knex('starmap_bg').del();
	// Importing starmap bg/objects from CSV works only if the CSV files are available on the database server.
	// If seeds need to be run on a remote PostgreSQL server that does not have the files,
	// PSQL copy command can be used:
	// \copy starmap_bg FROM '/home/nicou/git/odysseus-backend/db/data/starmap_bg.csv' DELIMITER ',' CSV HEADER
	// \copy starmap_object FROM '/home/nicou/git/odysseus-backend/db/data/starmap_object.csv' DELIMITER ',' CSV HEADER
	// Otherwise this will work:
	// await knex.raw(`COPY starmap_bg FROM '/fixtures/starmap_bg.csv' DELIMITER ',' CSV HEADER`);
	// await knex.raw(`COPY starmap_object FROM '/fixtures/starmap_object.csv' DELIMITER ',' CSV HEADER`);
	await knex('grid').insert(await getGrid());
	await knex('ship').insert(ships);
	await knex('grid_action').insert(gridActions);
	await Promise.all(personIds.map(id =>
		knex.raw(`UPDATE person SET ship_id = 'odysseus' WHERE id = ?`, id)));
};
