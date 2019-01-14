exports.up = async knex => {
	await knex.raw('DROP TABLE IF EXISTS artifact_research');
	await knex.raw('DROP TABLE IF EXISTS artifact');

	await knex.schema.createTable('artifact', t => {
		t.increments('id').primary();
		t.string('name').notNullable();
		t.timestamps(true, true);
	});

	await knex.schema.createTable('artifact_research', t => {
		t.increments('id').primary();
		t.integer('artifact_id').references('id').inTable('artifact').onDelete('CASCADE');
		// where the data came from, e.g. HANSCA_DNA, HANSCA_XRAY, MANUAL_ENTRY
		t.string('discovered_by');
		t.string('person_id').references('id').inTable('person').onDelete('CASCADE');
		t.text('text').notNullable();
		t.boolean('is_visible').defaultTo(false);
		t.timestamps(true, true);
	});
};

exports.down = async knex => {
	await knex.raw('DROP TABLE IF EXISTS artifact_research');
	await knex.raw('DROP TABLE IF EXISTS artifact');
};
