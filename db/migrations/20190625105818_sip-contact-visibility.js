exports.up = async knex => {
	await knex.schema.alterTable('sip_contact', t => {
		t.boolean('is_visible');
	});
};

exports.down = async knex => {
	await knex.schema.table('operation_result', t => {
		t.dropColumn('is_visible');
	});
};
