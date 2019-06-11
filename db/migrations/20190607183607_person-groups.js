exports.up = async knex => {
	await knex.schema.createTable('group', t => {
		t.string('id').primary();
		t.timestamps(true, true);
	});

	await knex.schema.createTable('person_group', t => {
		t.string('person_id').references('id').inTable('person').onDelete('CASCADE');
		t.string('group_id').references('id').inTable('group').onDelete('CASCADE');
		t.timestamps(true, true);
		t.primary(['person_id', 'group_id']);
	});
};

exports.down = async knex => {
	await knex.schema.dropTable('person_group');
	// Note to self: 'DROP TABLE group' does not work (you need to define the schema),
	// because "group" is a reserved keyword
	await knex.schema.dropTable('group');
};
