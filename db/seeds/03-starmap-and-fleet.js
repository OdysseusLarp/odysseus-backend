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

const ships = [
	{ id: 'odysseus', name: 'Odysseus', status: 'OPERATIONAL', game_state: '{}', grid_id: 1500 },
	{ id: 'starcaller', name: 'Starcaller', status: 'OPERATIONAL', game_state: null, grid_id: 1500 },
	{ id: 'dummy1', name: 'Dummy Ship 1', status: 'UNKNOWN', game_state: null, grid_id: 1500 },
	{ id: 'dummy2', name: 'Dummy Ship 2', status: 'UNKNOWN', game_state: null, grid_id: 1500 },
];

exports.seed = async knex => {
	await knex('ship').del();
	await knex('grid').del();
	await knex('grid').insert(await getGrid());
	await knex('ship').insert(ships);
};
