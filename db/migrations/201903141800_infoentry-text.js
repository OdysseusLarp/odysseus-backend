exports.up = async knex => {
	await knex.schema.table('infoboard_entry', t => {
		t.dropColumn('body');
	});
	await knex.schema.table('infoboard_entry', t => {
		t.text('body');
	});
};

exports.down = async knex => {
};
