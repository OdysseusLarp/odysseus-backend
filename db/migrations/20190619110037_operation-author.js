exports.up = async knex => {
	await knex.schema.alterTable('operation_result', t => {
		// author_id = id of the person who performed the operation
		t.string('author_id').references('id').inTable('person');
	});
};

exports.down = async knex => {
	await knex.schema.table('operation_result', t => {
		t.dropColumn('author_id');
	});
};
