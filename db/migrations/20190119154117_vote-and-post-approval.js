exports.up = async knex => {
	await knex.schema.alterTable('vote', t => {
		t.enum('status', ['PENDING', 'APPROVED', 'REJECTED']).defaultTo('PENDING').notNullable();
		// set to true to show this vote for everyone
		// set to false to only show it to those who can vote
		t.boolean('is_public').defaultTo(true).notNullable();
		t.specificType('allowed_groups', 'varchar(255)[]');
	});
	await knex.schema.alterTable('post', t => {
		t.enum('status', ['PENDING', 'APPROVED', 'REJECTED']).defaultTo('PENDING').notNullable();
	});
};

exports.down = async knex => {
	await knex.schema.alterTable('vote', t => {
		t.dropColumn('status');
		t.dropColumn('is_public');
		t.dropColumn('allowed_groups');
	});
	await knex.schema.alterTable('post', t => {
		t.dropColumn('status');
	});
};
