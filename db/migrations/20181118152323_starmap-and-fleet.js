exports.up = async knex => {
	await knex.raw('DROP TABLE IF EXISTS grid');
	await knex.raw('DROP TABLE IF EXISTS person_ship');
	await knex.raw('DROP TABLE IF EXISTS ship');

	// TODO: Replace this placeholder with Sanna's actual grid schema
	await knex.schema.createTable('grid', t => {
		t.string('id').primary();
		t.string('name').unique().notNullable();
		t.timestamps(true, true);
	});

	await knex.schema.createTable('ship', t => {
		t.string('id').primary();
		t.string('name').unique().notNullable();
		// TODO: make 'status' an enum when all possible statuses are known
		t.string('status');
		t.json('game_state');
		// Current grid that the ship is located in
		t.string('grid_id').references('id').inTable('grid');
		t.timestamps(true, true);
		t.index(['grid_id']);
	});

	// Joining table for person and ship
	await knex.schema.createTable('person_ship', t => {
		t.string('person_id').references('id').inTable('person').onDelete('CASCADE');
		t.string('ship_id').references('id').inTable('ship').onDelete('CASCADE');
		t.timestamps(true, true);
		t.primary(['person_id', 'ship_id']);
	});
};

exports.down = async knex => {
	await knex.raw('DROP TABLE IF EXISTS person_ship');
	await knex.raw('DROP TABLE IF EXISTS ship');
	await knex.raw('DROP TABLE IF EXISTS grid');
};
