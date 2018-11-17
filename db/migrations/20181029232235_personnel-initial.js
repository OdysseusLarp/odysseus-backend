exports.up = async knex => {
	await knex.raw('DROP TABLE IF EXISTS person_family');
	await knex.raw('DROP TABLE IF EXISTS person_medical_entries');
	await knex.raw('DROP TABLE IF EXISTS person');

	await knex.schema.createTable('person', t => {
		t.string('id').primary(); // Citizen ID
		t.string('chip_id').unique().notNullable();
		t.string('first_name').notNullable();
		t.string('last_name').notNullable();
		t.string('current_ship');
		t.string('previous_ship');
		t.string('title');
		// update 'status' to enum when all statuses are known
		t.string('status').notNullable();
		t.string('occupation');
		t.string('home_planet').notNullable();
		t.string('dynasty');
		t.string('dynasty_rank');
		t.integer('birth_year').notNullable();
		t.timestamps(true, true);
	});

	await knex.schema.createTable('person_family', t => {
		t.string('person1_id').references('id').inTable('person').onDelete('CASCADE');
		t.string('person2_id').references('id').inTable('person').onDelete('CASCADE');
		// update 'relation' to enum when all relations are known
		t.string('relation').notNullable();
		t.timestamps(true, true);
		t.primary(['person1_id', 'person2_id']);
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

	await knex.schema.createTable('medical_entry', t => {
		t.increments('id').primary();
		// just make the time a string at least for now
		t.string('time');
		t.text('details');
		t.timestamps(true, true);
	});

	// joining table for medical entries
	await knex.schema.createTable('person_medical_entry', t => {
		t.integer('entry_id').references('id').inTable('medical_entry').onDelete('CASCADE');
		t.string('person_id').references('id').inTable('person').onDelete('CASCADE');
		t.primary(['entry_id', 'person_id']);
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
};

exports.down = async knex => {
	await knex.raw('DROP TABLE IF EXISTS person_military_data');
	await knex.raw('DROP TABLE IF EXISTS person_medical_data');
	await knex.raw('DROP TABLE IF EXISTS person_medical_entry');
	await knex.raw('DROP TABLE IF EXISTS person_family');
	await knex.raw('DROP TABLE IF EXISTS person');
	await knex.raw('DROP TABLE IF EXISTS medical_entry');
};
