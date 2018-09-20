
exports.up = async knex => {
	await knex.schema.createTable('box', t => {
		t.increments('id').primary();
		t.string('name');
		t.json('value').defaultTo('{ "value": null }');
	});

	await knex.schema.createTable('task', t => {
		t.increments('id').primary();
		t.text('name');
		t.text('description');
		// Type of task, scheduled, GM...
		t.string('type');
		// List of systems where the task should be displayed
		t.specificType('systems', 'text[]');
	});

	await knex.schema.createTable('task_requirement', t => {
		t.increments('id').primary();
		t.integer('task_id').references('id').inTable('task').notNullable().onDelete('cascade');
		t.integer('box_id').references('id').inTable('box').notNullable().onDelete('cascade');
		t.json('requirements').notNullable();
	});
};

exports.down = async knex => {
	await knex.raw('DROP TABLE IF EXISTS task_requirement');
	await knex.raw('DROP TABLE IF EXISTS task');
	await knex.raw('DROP TABLE IF EXISTS box');
};
