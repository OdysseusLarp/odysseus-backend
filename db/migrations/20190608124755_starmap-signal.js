exports.up = async knex => {
	await knex.schema.createTable('starmap_beacon', t => {
		t.string('id').primary();
		t.integer('grid_id').references('id').inTable('grid');
		t.boolean('is_active').notNullable();
		t.timestamps(true, true);
	});

	// Add has_beacon column to starmap_grid view so that the grid with an active
	// beacon can be styled differently on geoserver
	await knex.raw(`DROP VIEW IF EXISTS starmap_grid_info`);
	await knex.raw(`
	CREATE OR REPLACE VIEW starmap_grid_info AS
		SELECT *,
			(SELECT COUNT(*) FROM starmap_object_visible sov
				WHERE sov.celestial_body = 'planet' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS planet_count,
			(SELECT COUNT(*) FROM starmap_object_visible sov
				WHERE sov.celestial_body = 'comet' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS comet_count,
			(SELECT COUNT(*) FROM starmap_object_visible sov
				WHERE sov.celestial_body = 'natural satellite' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS natural_satellite_count,
			(SELECT COUNT(*) FROM starmap_object_visible sov
				WHERE sov.celestial_body = 'asteroid' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS asteroid_count,
			(SELECT id FROM grid_action ga
				WHERE ga.grid_id = grid.id AND ga.type IN ('SCAN', 'JUMP') LIMIT 1)::boolean
				AS is_discovered,
			(SELECT TRUE FROM starmap_beacon b
				WHERE b.grid_id = grid.id AND b.is_active IS TRUE LIMIT 1)::BOOLEAN
				AS has_beacon
		FROM grid;
	`);

	// Make starmap_fleet view only show the ships that have status 'Present and accounted for' in addition to
	// having is_visible = TRUE
	await knex.raw(`DROP VIEW IF EXISTS starmap_fleet`);
	await knex.raw(`
	CREATE OR REPLACE VIEW starmap_fleet AS SELECT DISTINCT
	the_geom,
		(SELECT TRUE FROM ship s WHERE id = 'odysseus' AND ship.the_geom = s.the_geom  AND s.is_visible = TRUE AND s.status = 'Present and accounted for') AS has_odysseus,
		(SELECT COUNT(*) FROM ship s WHERE type = 'Military' AND ship.the_geom = s.the_geom AND s.is_visible = TRUE AND s.status = 'Present and accounted for') AS count_military,
		(SELECT COUNT(*) FROM ship s WHERE type = 'Civilian' AND ship.the_geom = s.the_geom AND s.is_visible = TRUE AND s.status = 'Present and accounted for') AS count_civilian,
		(SELECT json_agg(DISTINCT name)::jsonb FROM ship s WHERE ship.the_geom = s.the_geom AND s.is_visible = TRUE AND s.status = 'Present and accounted for') AS ships
	FROM ship WHERE ship.is_visible = TRUE AND ship.status = 'Present and accounted for';
	`);
};

exports.down = async knex => {
	await knex.raw(`DROP VIEW IF EXISTS starmap_grid_info`);
	await knex.raw(`
	CREATE OR REPLACE VIEW starmap_grid_info AS
		SELECT *,
			(SELECT COUNT(*) FROM starmap_object_visible sov
				WHERE sov.celestial_body = 'planet' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS planet_count,
			(SELECT COUNT(*) FROM starmap_object_visible sov
				WHERE sov.celestial_body = 'comet' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS comet_count,
			(SELECT COUNT(*) FROM starmap_object_visible sov
				WHERE sov.celestial_body = 'natural satellite' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS natural_satellite_count,
			(SELECT COUNT(*) FROM starmap_object_visible sov
				WHERE sov.celestial_body = 'asteroid' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS asteroid_count,
			(SELECT id FROM grid_action ga
				WHERE ga.grid_id = grid.id AND ga.type IN ('SCAN', 'JUMP') LIMIT 1)::boolean
				AS is_discovered
		FROM grid;
	`);
	await knex.raw(`DROP VIEW IF EXISTS starmap_grid`);
	await knex.raw(`
	CREATE OR REPLACE VIEW starmap_fleet AS SELECT DISTINCT
	the_geom,
		(SELECT TRUE FROM ship s WHERE id = 'odysseus' AND ship.the_geom = s.the_geom  AND s.is_visible = TRUE) AS has_odysseus,
		(SELECT COUNT(*) FROM ship s WHERE type = 'Military' AND ship.the_geom = s.the_geom AND s.is_visible = TRUE) AS count_military,
		(SELECT COUNT(*) FROM ship s WHERE type = 'Civilian' AND ship.the_geom = s.the_geom AND s.is_visible = TRUE) AS count_civilian,
		(SELECT json_agg(DISTINCT name)::jsonb FROM ship s WHERE ship.the_geom = s.the_geom AND s.is_visible = TRUE) AS ships
	FROM ship WHERE ship.is_visible = TRUE;
	`);
	await knex.schema.dropTable('starmap_beacon');
};
