exports.up = async knex => {
	await knex.schema.alterTable('artifact', t => {
		t.string('catalog_id').unique();
		t.index(['catalog_id']);
	});

	await knex.schema.createTable('tag', t => {
		t.increments('id').primary();
		t.string('tag_id').notNullable().unique();
		t.string('type'); // Tag type, e.g. 'DNA_TEST', 'BLOOD_TEST', 'DIAGNOSIS', 'ENGINEERING'
		t.text('description');
		t.json('metadata');
		t.timestamps(true, true);
	});

	await knex.schema.createTable('operation_result', t => {
		t.increments('id').primary();
		t.string('bio_id').references('bio_id').inTable('person');
		t.string('catalog_id').references('catalog_id').inTable('artifact');
		t.string('tag_id').references('tag_id').inTable('tag');
		t.string('sample_id'); // E.g. vial number
		t.boolean('is_analysed').defaultTo(false);
		t.boolean('is_complete').defaultTo(false); // True when GMs have marked the operation as complete
		t.string('type').notNullable(); // Operation type, e.g. 'DNA_TEST', 'BLOOD_TEST', 'DIAGNOSIS', 'ENGINEERING'
		t.json('metadata');
		t.timestamps(true, true);
	});
};

exports.down = async knex => {
	await knex.raw(`DROP TABLE operation_result`);
	await knex.raw(`DROP TABLE tag`);
	await knex.schema.alterTable('artifact', t => {
		t.dropColumn('catalog_id');
	});
};
