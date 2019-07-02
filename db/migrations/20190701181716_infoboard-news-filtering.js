exports.up = async knex => {
	await knex.schema.alterTable('post', t => {
		t.boolean('show_on_infoboard').defaultTo(true);
	});
};

exports.down = async knex => {
	await knex.schema.table('post', t => {
		t.dropColumn('show_on_infoboard');
	});
};
