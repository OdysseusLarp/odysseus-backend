
exports.up = async knex => {
	await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');

	await knex.schema.createTable('grid', t => {
		t.string('sector', 14).notNullable();
		t.integer('zoom_level').notNullable();
		t.specificType('the_geom', 'geometry').notNullable();
		t.timestamps(true, true);
	});
	await knex.raw('CREATE INDEX geo_index ON grid USING GIST (the_geom)');
};

exports.down = async knex => {
	await knex.raw('DROP TABLE IF EXISTS grid');
	await knex.raw('DROP INDEX IF EXISTS geo_index');
	await knex.raw('DROP EXTENSION IF EXISTS postgis');
};
