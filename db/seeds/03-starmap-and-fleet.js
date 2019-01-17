const csv = require('csvtojson');
const path = require('path');
const isEmpty = require('lodash').isEmpty;

// Read the grid from CSV and convert the columns to have correct types
async function getGrid() {
	const csvPath = path.join(__dirname, '../../fixtures/grid.csv');
	const grids = await csv().fromFile(csvPath);
	return grids.map(grid => {
		['quadrant', 'sector', 'sub_sector', 'name'].forEach(col => {
			if (!grid[col]) delete grid[col];
		});
		['id', 'zoom', 'x', 'y'].forEach(col => {
			if (isEmpty(grid[col])) grid[col] = null;
			else grid[col] = Number(grid[col]);
		});
		return grid;
	});
}

/* eslint-disable-next-line camelcase */
const the_geom = '0101000020110F000000000000000000000000000000000000';

const ships = [
	{
		id: 'odysseus',
		name: 'Odysseus',
		status: 'OPERATIONAL',
		game_state: '{}',
		grid_id: 1500,
		the_geom,
		metadata: { jump_range: 1 },
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

const gridActions = [{
	ship_id: 'odysseus',
	grid_id: 7,
	type: 'SCAN'
}];

const personIds = ['593201', '593202', '593203', '593204', '593205'];

exports.seed = async knex => {
	await knex('event').del();
	await knex('ship').del();
	await knex('grid').del();
	await knex('grid').insert(await getGrid());
	await knex('ship').insert(ships);
	await knex('grid_action').insert(gridActions);
	await Promise.all(personIds.map(id =>
		knex.raw(`UPDATE person SET ship_id = 'odysseus' WHERE id = ?`, id)));
};
