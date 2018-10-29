exports.up = async knex => {
	await knex.raw('DROP TABLE IF EXISTS box');
	await knex.schema.createTable('box', t => {
		t.integer('id').primary();
		t.json('value').defaultTo('{ "value": null }');
		t.bigInteger('version').defaultTo(1);
		t.timestamps(true, true);
	});
};

exports.down = async knex => {
	await knex.raw('DROP TABLE IF EXISTS box');
};
