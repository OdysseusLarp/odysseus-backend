exports.up = async knex => {
	await knex.raw(`DROP TABLE artifact_research`);

	await knex.schema.alterTable('artifact', t => {
		t.string('discovered_at');
		t.string('discovered_by');
		t.string('discovered_from');
		t.string('type');
		t.text('text');
	});

	await knex.schema.createTable('artifact_entry', t => {
		t.increments('id').primary();
		t.string('artifact_id').references('id').inTable('person').notNullable();
		t.string('added_by').references('id').inTable('person');
		t.text('entry');
		t.timestamps(true, true);
		t.index(['person_id']);
		t.index(['type']);
	});
};

exports.down = async knex => {
	await knex.raw(`DROP TABLE artifact_entry`);

	await knex.schema.alterTable('artifact', t => {
		t.dropColumn('discovered_at');
		t.dropColumn('discovered_by');
		t.dropColumn('discovered_from');
		t.dropColumn('type');
		t.dropColumn('text');
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
