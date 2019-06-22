exports.up = async knex => {
	await knex.raw(`DROP VIEW IF EXISTS starmap_grid_info`);
	await knex.raw(`
	CREATE OR REPLACE VIEW starmap_grid_info AS
		SELECT *,
			(SELECT COUNT(*) FROM starmap_object sov
				WHERE sov.celestial_body = 'planet' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS planet_count,
			(SELECT COUNT(*) FROM starmap_object sov
				WHERE sov.celestial_body = 'comet' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS comet_count,
			(SELECT COUNT(*) FROM starmap_object sov
				WHERE sov.celestial_body = 'natural satellite' AND ST_Contains(grid.the_geom, sov.the_geom))
				AS natural_satellite_count,
			(SELECT COUNT(*) FROM starmap_object sov
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
				AS is_discovered,
			(SELECT TRUE FROM starmap_beacon b
				WHERE b.grid_id = grid.id AND b.is_active IS TRUE LIMIT 1)::BOOLEAN
				AS has_beacon
		FROM grid;
	`);
};
