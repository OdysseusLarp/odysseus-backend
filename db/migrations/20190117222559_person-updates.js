exports.up = async knex => {
	await knex.raw(`UPDATE person SET dynasty_rank = '1'`);
	await knex.schema.alterTable('person', t => {
		t.integer('dynasty_rank').alter();
		t.string('ship_id').references('id').inTable('ship');
		t.dropColumn('current_ship');
		t.dropColumn('previous_ship');
	});
};

exports.down = async knex => {
	await knex.schema.alterTable('person', t => {
		t.string('dynasty_rank').alter();
		t.dropColumn('ship_id');
		t.string('current_ship');
		t.string('previous_ship');
	});
};
