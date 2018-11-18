const grid = [
	{ id: '1', name: 'One' },
	{ id: '2', name: 'Two' },
	{ id: '3', name: 'Three' },
	{ id: '4', name: 'Four' },
];

const ships = [
	{ id: 'odysseus', name: 'Odysseus', status: 'OPERATIONAL', game_state: '{}', grid_id: '1' },
	{ id: 'starcaller', name: 'Starcaller', status: 'OPERATIONAL', game_state: null, grid_id: '1' },
	{ id: 'dummy1', name: 'Dummy Ship 1', status: 'UNKNOWN', game_state: null, grid_id: '1' },
	{ id: 'dummy2', name: 'Dummy Ship 2', status: 'UNKNOWN', game_state: null, grid_id: '1' },
];

exports.seed = async knex => {
	await knex('ship').del();
	await knex('grid').del();
	await knex('grid').insert(grid);
	await knex('ship').insert(ships);
};
