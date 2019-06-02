exports.up = async knex => {
	await knex.schema.alterTable('vote', t => {
		t.integer('duration_minutes');
		t.string('allowed_voters');
		t.dropColumn('allowed_groups');
	});

	await knex.schema.createTable('audit_log', t => {
		t.increments('id').primary();
		t.string('type').notNullable(); // 'LOGIN' or 'LOGOUT'
		t.string('person_id').references('id').inTable('person').notNullable();
		t.string('hacker_id').references('id').inTable('person');
		t.json('metadata');
		t.timestamps(true, true);
	});
};

exports.down = async knex => {
	await knex.schema.alterTable('vote', t => {
		t.dropColumn('duration_minutes');
		t.dropColumn('allowed_voters');
		t.specificType('allowed_groups', 'varchar(255)[]');
	});

	await knex.raw(`DROP TABLE audit_log`);
};
