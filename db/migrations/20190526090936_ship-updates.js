exports.up = async knex => {
	await knex.schema.alterTable('ship', t => {
		t.dropColumn('game_state');
		t.integer('fighter_count').defaultTo(0);
		t.integer('transporter_count').defaultTo(0);
		t.text('description');
		t.boolean('is_visible');
	});
	await knex.raw(`ALTER TABLE ship ALTER COLUMN created_at DROP NOT NULL`);
	await knex.raw(`ALTER TABLE ship ALTER COLUMN updated_at DROP NOT NULL`);

	// View for fleet - one row per ship in each grid to display fleet on starmap
	// Added ships column that holds an array of ship names located in that grid
	await knex.raw(`DROP VIEW IF EXISTS starmap_fleet`);
	await knex.raw(`
	CREATE OR REPLACE VIEW starmap_fleet AS SELECT DISTINCT
	the_geom,
		(SELECT TRUE FROM ship s WHERE id = 'odysseus' AND ship.the_geom = s.the_geom) AS has_odysseus,
		(SELECT COUNT(*) FROM ship s WHERE type = 'Military' AND ship.the_geom = s.the_geom) AS count_military,
		(SELECT COUNT(*) FROM ship s WHERE type = 'Civilian' AND ship.the_geom = s.the_geom) AS count_civilian,
		(SELECT json_agg(DISTINCT name)::jsonb FROM ship s WHERE ship.the_geom = s.the_geom) AS ships
	FROM ship;
	`);
};

exports.down = async knex => {
	await knex.schema.alterTable('ship', t => {
		t.json('game_state');
		t.dropColumn('fighter_count');
		t.dropColumn('transporter_count');
		t.dropColumn('description');
		t.dropColumn('is_visible');
	});
	await knex.raw(`ALTER TABLE ship ALTER COLUMN created_at SET NOT NULL`);
	await knex.raw(`ALTER TABLE ship ALTER COLUMN updated_at SET NOT NULL`);

	// View for fleet - one row per ship in each grid to display fleet on starmap
	await knex.raw(`DROP VIEW IF EXISTS starmap_fleet`);
	await knex.raw(`
	CREATE OR REPLACE VIEW starmap_fleet AS SELECT DISTINCT
		the_geom,
		(SELECT TRUE FROM ship s WHERE id = 'odysseus' AND ship.the_geom = s.the_geom) AS has_odysseus,
		(SELECT COUNT(*) FROM ship s WHERE type = 'MILITARY' AND ship.the_geom = s.the_geom) AS count_military,
		(SELECT COUNT(*) FROM ship s WHERE type = 'CARGO' AND ship.the_geom = s.the_geom) AS count_cargo,
		(SELECT COUNT(*) FROM ship s WHERE type = 'RESEARCH' AND ship.the_geom = s.the_geom) AS count_research,
		(SELECT COUNT(*) FROM ship s WHERE type = 'CIVILIAN' AND ship.the_geom = s.the_geom) AS count_civilian
		FROM ship
	`);
};
