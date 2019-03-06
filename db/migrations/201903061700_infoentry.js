exports.up = async knex => {
	// Table for infoboard entries
	await knex.schema.createTable('infoboard_entry', t => {
	        t.increments('id').primary();
	        t.integer('priority').notNullable();
	        t.boolean('enabled').notNullable();
	        t.string('title').notNullable();
	        t.string('body').notNullable();
		t.timestamps(true, true);
	});
};

exports.down = async knex => {
	await knex.raw('DROP TABLE IF EXISTS infoboard_entry');
};
