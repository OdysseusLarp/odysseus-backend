exports.up = async knex => {
	await knex.schema.createTable('person_blood_test_result', t => {
		t.increments('id').primary();
		t.string('person_id').references('id').inTable('person').notNullable();

		// Most of these fields are actually numbers, but I don't think we ever need to search for
		// "all person with hemoglobin > 140" or anything
		t.string('blood_type');
		t.string('hemoglobin');
		t.string('leukocytes');
		t.string('kalium');
		t.string('natrium');
		t.string('hcg');
		t.string('acn_enzyme');
		t.string('sub_abuse');
		t.text('details');

		t.timestamps(true, true);
	});
};

exports.down = async knex => {
	await knex.schema.dropTable('person_blood_test_result');
};
