const csv = require('csvtojson');
const path = require('path');
const isEmpty = require('lodash').isEmpty;
const shell = require('shelljs');

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

// Odysseus metadata
const odysseusMetadata = {
	jump_range: 1,
	scan_range: 1,
	probe_count: 27,
	jump_crystal_count: 22,
	object_scan_duration: {
		min_seconds: 30,
		max_seconds: 60
	},
	grid_scan_duration: {
		min_seconds: 30,
		max_seconds: 60
	},
};

async function cleanup(knex) {
	// set current person ships to null before dropping ships
	await knex.raw(`UPDATE person SET ship_id = NULL`);
	// delete audit logs since they have references to persons
	await knex.raw(`DELETE FROM audit_log`);

	await knex('event').del();
	await knex('ship').del();
	await knex('starmap_beacon').del();
	await knex('grid').del();
	await knex('starmap_object').del();
	await knex('starmap_bg').del();
}

async function insertGrid(knex) {
	await knex('grid').insert(await getGrid());
}

async function insertRest(knex) {
	await knex.raw(`UPDATE ship SET created_at = NOW(), updated_at = NOW()`);
	await knex.raw(`UPDATE ship SET metadata = ? WHERE id = 'odysseus'`, [odysseusMetadata]);

	// Visited grids
	await knex('grid_action').insert(gridActions);

	await Promise.all(personIds.map(id =>
		knex.raw(`UPDATE person SET ship_id = 'odysseus' WHERE id = ?`, id)));

	// Beacons
	const beacons = [
		{ id: 'VELIAN', grid_id: 5236, is_active: false, is_decrypted: false },
		{ id: 'WAYHOME', grid_id: 5218, is_active: false, is_decrypted: false },
		{ id: 'JOURNEY', grid_id: 5185, is_active: false, is_decrypted: false },
		{ id: 'SALVATION', grid_id: 4943, is_active: false, is_decrypted: false },
		{ id: 'CONFESSION', grid_id: 4911, is_active: false, is_decrypted: false },
		{ id: 'EARTH', grid_id: 5137, is_active: false, is_decrypted: false },
		{ id: 'HOPE', grid_id: 4863, is_active: false, is_decrypted: false },
	];
	await knex('starmap_beacon').insert(beacons);
}

async function seedLocal(knex) {
	await cleanup(knex);

	// Importing starmap bg/objects from CSV works only if the CSV files are available on the database server.
	// If seeds need to be run on a remote PostgreSQL server that does not have the files, PSQL copy command can be used.
	await knex.raw(`COPY starmap_bg FROM '/fixtures/starmap_bg.csv' DELIMITER ',' CSV HEADER`);
	await knex.raw(`COPY starmap_object FROM '/fixtures/starmap_object.csv' DELIMITER ',' CSV HEADER`);

	await insertGrid(knex);

	await knex.raw(`COPY ship FROM '/fixtures/ship.csv' DELIMITER ',' CSV HEADER`);

	await insertRest(knex);
}

async function seedServer(knex) {
	if (shell.exec('psql --version').code !== 0) throw new Error('No PSQL installed');

	const scriptPath = `${__dirname}/../../scripts`;

	await cleanup(knex);

	// Run starmap seed script
	shell.exec(`bash ${path.join(scriptPath, 'seed-starmap.sh')}`);

	await insertGrid(knex);

	// Run ship seed script
	shell.exec(`bash ${path.join(scriptPath, 'seed-ship.sh')}`);

	await insertRest(knex);
}

exports.seed = async knex => {
	try {
		await seedLocal(knex);
	} catch (err) {
		console.log('Local seeds failed, attempting server seed');
		await seedServer(knex);
	}
};
