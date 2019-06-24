exports.up = async knex => {
	await knex.schema.alterTable('operation_result', t => {
		// additional_type = type that players can freely type
		t.string('additional_type');
	});
};

exports.down = async knex => {
	await knex.schema.table('operation_result', t => {
		t.dropColumn('additional_type');
	});
};
