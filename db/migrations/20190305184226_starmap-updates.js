async function fixViews(knex) {
	await knex.raw('DROP VIEW IF EXISTS starmap_object_star');
	await knex.raw('DROP VIEW IF EXISTS starmap_object_visible');

	// View for stars
	await knex.raw(`CREATE VIEW starmap_object_star AS SELECT * FROM starmap_object WHERE celestial_body = 'star'`);

	// View for non-star objects located in grids which have been visited/scanned
	await knex.raw(`
		CREATE VIEW starmap_object_visible AS
			SELECT * FROM starmap_object
				WHERE celestial_body != 'star'
				AND ST_Within(
					the_geom,
					(SELECT ST_Union(
						(SELECT ARRAY(
							SELECT the_geom FROM grid WHERE id IN
							(SELECT DISTINCT grid_id FROM grid_action)
						)))));
	`);
}

exports.up = async knex => {
	await knex.schema.alterTable('starmap_object', t => {
		t.specificType('distance', 'real');
		t.specificType('surface_gravity', 'real');
	});
	await knex.schema.alterTable('grid', t => {
		t.text('sub_quadrant');
	});

	// Drop and re-create views because of added columns
	await fixViews(knex);

	// View for fetching grid data
	await knex.raw(`
	CREATE VIEW starmap_grid_info AS
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
				WHERE ga.grid_id = grid.id AND ga.type IN ('SCAN', 'JUMP'))::boolean
				AS is_discovered
		FROM grid;
	`);
};

exports.down = async knex => {
	await knex.raw(`DROP VIEW starmap_grid_info`);
	await knex.schema.alterTable('starmap_object', t => {
		t.dropColumn('distance');
		t.dropColumn('surface_gravity');
	});
	await knex.schema.alterTable('grid', t => {
		t.dropColumn('sub_quadrant');
	});

	// Drop and re-create views because of removed columns
	await fixViews(knex);
};
