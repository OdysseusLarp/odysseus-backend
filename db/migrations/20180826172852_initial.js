
exports.up = async function(knex) {
	await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');
	await knex.raw('CREATE SCHEMA starmap');
	await knex.raw('CREATE SCHEMA odysseus');

	await knex.schema.withSchema('starmap').createTable('grid', t => {
		t.string('sector', 14).notNullable();
		t.integer('zoom_level').notNullable();
		t.specificType('the_geom', 'geometry').notNullable();
	});
	await knex.raw('CREATE INDEX geo_index ON starmap.grid USING GIST (the_geom)');
};

exports.down = async function(knex) {
	await knex.raw('DROP SCHEMA starmap CASCADE');
	await knex.raw('DROP SCHEMA odysseus CASCADE');
	await knex.raw('DROP EXTENSION postgis');
};
