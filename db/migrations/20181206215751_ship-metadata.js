exports.up = async knex => {
	await knex.schema.table('ship', t => {
		t.json('metadata');
	});
};

exports.down = async knex => {
	await knex.schema.updateTable('ship', t => {
		t.dropColumn('metadata');
	});
};
