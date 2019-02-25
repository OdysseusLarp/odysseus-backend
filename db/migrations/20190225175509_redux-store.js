exports.up = async knex => {
	await knex.raw('DROP TABLE IF EXISTS store');

	await knex.schema.createTable('store', t => {
		// Use Redux reducer name as primary key
		t.string('id').primary();
		t.json('data');
		t.timestamps(true, true);
	});
};

exports.down = async knex => {
	await knex.raw('DROP TABLE IF EXISTS store');
};
