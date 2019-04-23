exports.up = async knex => {
	await knex.schema.alterTable('person', t => {
		t.boolean('is_visible').defaultTo(true);
		t.string('bio_id').unique();
		t.index(['first_name', 'last_name']);
		t.index(['bio_id']);
	});
	await knex.raw('UPDATE person SET bio_id = id');
	await knex.raw('ALTER TABLE person RENAME chip_id TO card_id');
	await knex.schema.alterTable('person', t => {
		t.index(['card_id']);
	});
};

exports.down = async knex => {
	await knex.raw('DROP INDEX IF EXISTS person_first_name_last_name_index');
	await knex.raw('DROP INDEX IF EXISTS person_card_id_index');
	await knex.raw('DROP INDEX IF EXISTS person_bio_id_index');
	await knex.schema.alterTable('person', t => {
		t.dropColumn('is_visible');
		t.dropColumn('bio_id');
	});
	await knex.raw('ALTER TABLE person RENAME card_id TO chip_id');
};
