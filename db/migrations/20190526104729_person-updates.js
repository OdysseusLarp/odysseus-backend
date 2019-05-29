exports.up = async knex => {
	await knex.raw(`ALTER TABLE person ALTER COLUMN card_id DROP NOT NULL`);
	await knex.raw(`ALTER TABLE person ALTER COLUMN birth_year DROP NOT NULL`);
	await knex.raw(`ALTER TABLE person ALTER COLUMN last_name DROP NOT NULL`);

	await knex.schema.alterTable('person', t => {
		t.boolean('is_character');
		// citizen_id is like HETU, it does not have any function in the game but is shown in person data
		t.string('citizen_id');
		t.string('religion');
		t.string('citizenship');
		t.string('social_class');
		t.string('political_party');
		t.string('military_rank');
		t.text('military_remarks');
		t.text('military_service_history');
		t.string('medical_fitness_level');
		t.integer('medical_last_fitness_check');
		t.string('medical_blood_type');
		t.text('medical_allergies');
		t.text('medical_active_conditions');
		t.text('medical_current_medication');
		t.integer('created_year'); // year when the person was inserted into the system
		t.dropColumn('dynasty_rank');
	});

	await knex.raw(`DROP TABLE person_military_data`);
	await knex.raw(`DROP TABLE person_medical_data`);
	await knex.raw(`DROP TABLE person_medical_entry`);

	// Table for medical/military/personal entries
	await knex.schema.createTable('person_entry', t => {
		t.increments('id').primary();
		t.string('person_id').references('id').inTable('person').notNullable();
		t.string('added_by').references('id').inTable('person');
		t.string('type'); // MEDICAL, MILITARY, PERSONAL
		t.text('entry');
		t.timestamps(true, true);
		t.index(['person_id']);
		t.index(['type']);
	});
};

exports.down = async knex => {
	await knex.raw(`UPDATE person SET birth_year = 0 WHERE birth_year IS NULL`);
	await knex.raw(`UPDATE person SET last_name = '<None>' WHERE last_name IS NULL`);
	await knex.raw(`ALTER TABLE person ALTER COLUMN updated_at SET NOT NULL`);
	await knex.raw(`ALTER TABLE person ALTER COLUMN birth_year SET NOT NULL`);
	await knex.raw(`ALTER TABLE person ALTER COLUMN last_name SET NOT NULL`);

	await knex.schema.alterTable('person', t => {
		t.string('dynasty_rank');
		t.dropColumn('is_character');
		t.dropColumn('citizen_id');
		t.dropColumn('religion');
		t.dropColumn('citizenship');
		t.dropColumn('social_class');
		t.dropColumn('political_party');
		t.dropColumn('military_rank');
		t.dropColumn('military_remarks');
		t.dropColumn('military_service_history');
		t.dropColumn('medical_fitness_level');
		t.dropColumn('medical_last_fitness_check');
		t.dropColumn('medical_blood_type');
		t.dropColumn('medical_allergies');
		t.dropColumn('medical_active_conditions');
		t.dropColumn('medical_current_medication');
		t.dropColumn('created_year');
	});

	await knex.schema.createTable('person_medical_entry', t => {
		t.integer('entry_id').references('id').inTable('medical_entry').onDelete('CASCADE');
		t.string('person_id').references('id').inTable('person').onDelete('CASCADE');
		t.primary(['entry_id', 'person_id']);
	});

	await knex.schema.createTable('person_medical_data', t => {
		t.string('person_id').references('id').inTable('person').notNullable();
		t.string('blood_type');
		t.text('surgeries');
		t.text('medication');
		t.text('immunization');
		t.text('allergies');
		t.text('medical_history');
		t.timestamps(true, true);
		t.primary('person_id');
	});

	await knex.schema.createTable('person_military_data', t => {
		t.string('person_id').references('id').inTable('person').notNullable();
		t.string('rank');
		t.string('unit');
		t.text('remarks');
		t.text('service_history');
		t.timestamps(true, true);
		t.primary('person_id');
	});

	await knex.raw(`DROP TABLE person_entry`);
};
