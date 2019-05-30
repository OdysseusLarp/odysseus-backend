exports.up = async knex => {
	// Only show visible ships in this view
	await knex.raw(`DROP VIEW IF EXISTS starmap_fleet`);
	await knex.raw(`
	CREATE OR REPLACE VIEW starmap_fleet AS SELECT DISTINCT
	the_geom,
		(SELECT TRUE FROM ship s WHERE id = 'odysseus' AND ship.the_geom = s.the_geom  AND s.is_visible = TRUE) AS has_odysseus,
		(SELECT COUNT(*) FROM ship s WHERE type = 'Military' AND ship.the_geom = s.the_geom AND s.is_visible = TRUE) AS count_military,
		(SELECT COUNT(*) FROM ship s WHERE type = 'Civilian' AND ship.the_geom = s.the_geom AND s.is_visible = TRUE) AS count_civilian,
		(SELECT json_agg(DISTINCT name)::jsonb FROM ship s WHERE ship.the_geom = s.the_geom AND s.is_visible = TRUE) AS ships
	FROM ship WHERE ship.is_visible = TRUE;
	`);
};

exports.down = async knex => {
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
