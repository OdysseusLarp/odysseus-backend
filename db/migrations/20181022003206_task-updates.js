exports.up = async knex => {
	await knex.raw('DROP TABLE IF EXISTS task_requirement');
	await knex.raw('DROP TABLE IF EXISTS box');

	await knex.schema.table('task', t => {
		t.boolean('is_active');
	});
};

exports.down = async knex => {
	await knex.schema.createTable('box', t => {
		t.increments('id').primary();
		t.string('name');
		t.json('value').defaultTo('{ "value": null }');
		t.timestamps(true, true);
	});

	await knex.schema.createTable('task_requirement', t => {
		t.increments('id').primary();
		t.integer('task_id').references('id').inTable('task').notNullable().onDelete('cascade');
		t.integer('box_id').references('id').inTable('box').notNullable().onDelete('cascade');
		t.json('requirements').notNullable();
		t.timestamps(true, true);
	});

	await knex.schema.updateTable('task', t => {
		t.dropColumn('is_active');
	});
};
