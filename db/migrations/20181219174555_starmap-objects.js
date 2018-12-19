exports.up = async knex => {
	await knex.raw('DROP INDEX IF EXISTS starmap_bg_geoindex');
	await knex.raw('DROP INDEX IF EXISTS starmap_object_geoindex');
	await knex.raw('DROP INDEX IF EXISTS ship_geoindex');
	await knex.raw('DROP VIEW IF EXISTS starmap_object_star');
	await knex.raw('DROP VIEW IF EXISTS starmap_object_visible');
	await knex.raw('DROP VIEW IF EXISTS starmap_fleet');
	await knex.raw('DROP VIEW IF EXISTS starmap_jump_range');

	// Add geometry, class and type to ship
	await knex.schema.table('ship', t => {
		t.specificType('the_geom', 'geometry(Geometry,3857)');
		t.string('class'); // model of the ship
		t.string('type'); // cargo, military, civilian etc.
	});

	// Table for stars used for rendering the starmap background
	await knex.schema.createTable('starmap_bg', t => {
		t.increments('id').primary();
		t.specificType('gs_size', 'real').notNullable();
		t.specificType('gs_size_scale', 'real').notNullable();
		t.specificType('gs_size_halo', 'real').notNullable();
		t.specificType('gs_fill_opacity', 'real').notNullable();
		t.specificType('gs_rotation', 'bigint').notNullable();
		t.specificType('the_geom', 'geometry(Geometry,3857)').notNullable();
	});

	// Table for planets, moons etc.
	await knex.schema.createTable('starmap_object', t => {
		t.increments('id').primary();
		t.string('name_generated').notNullable();
		t.boolean('is_scanned').defaultTo(false).notNullable();
		t.text('description');
		t.boolean('ring_system');
		t.specificType('radius', 'bigint').notNullable();
		t.specificType('mass', 'numeric(35,0)').notNullable();
		t.string('habitable_zone');
		t.string('name_known');
		t.string('celestial_body');
		t.string('atmosphere');
		t.string('satellite_of');
		t.string('category');
		t.specificType('temperature', 'bigint');
		t.specificType('orbital_period', 'real');
		t.specificType('rotation', 'real');
		t.specificType('orbiter_count', 'bigint');
		t.specificType('atm_pressure', 'double precision');
		t.specificType('gs_size', 'real').notNullable();
		t.specificType('gs_size_scale', 'real').notNullable();
		t.specificType('gs_size_halo', 'real').notNullable();
		t.specificType('gs_fill_opacity', 'real').notNullable();
		t.specificType('gs_rotation', 'bigint').notNullable();
		t.specificType('the_geom', 'geometry(Geometry,3857)').notNullable();
		t.index(['name_generated', 'satellite_of', 'celestial_body']);
	});

	// Table for visited / scanned grids
	await knex.schema.createTable('grid_action', t => {
		t.increments('id').primary();
		t.integer('grid_id').references('id').inTable('grid').onDelete('CASCADE');
		t.string('ship_id').references('id').inTable('ship').onDelete('CASCADE');
		t.string('type'); // VISITED, SCANNED
		t.timestamps(true, true);
		t.index(['grid_id']);
	});

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

	// View for fleet - one row per ship in each grid to display fleet on starmap
	await knex.raw(`
	CREATE VIEW starmap_fleet AS SELECT DISTINCT
		the_geom,
		(SELECT TRUE FROM ship s WHERE id = 'odysseus' AND ship.the_geom = s.the_geom) AS has_odysseus,
		(SELECT COUNT(*) FROM ship s WHERE type = 'MILITARY' AND ship.the_geom = s.the_geom) AS count_military,
		(SELECT COUNT(*) FROM ship s WHERE type = 'CARGO' AND ship.the_geom = s.the_geom) AS count_cargo,
		(SELECT COUNT(*) FROM ship s WHERE type = 'RESEARCH' AND ship.the_geom = s.the_geom) AS count_research,
		(SELECT COUNT(*) FROM ship s WHERE type = 'CIVILIAN' AND ship.the_geom = s.the_geom) AS count_civilian
		FROM ship
	`);

	// View for displaying ship jump range
	await knex.raw(`
	CREATE VIEW starmap_jump_range AS SELECT
		ST_Buffer(
			(SELECT the_geom FROM grid WHERE id = grid_id),
			(ST_Perimeter(
				(SELECT the_geom FROM grid WHERE id = grid_id))
				/ 4
				* (SELECT (metadata->>'jump_range')::float FROM ship WHERE id = 'odysseus')
			), 'join=mitre endcap=square') AS the_geom
		FROM ship WHERE id = 'odysseus';
	`);

	// Create geospatial indexes
	await knex.raw('CREATE INDEX ship_geoindex ON ship USING GIST (the_geom)');
	await knex.raw('CREATE INDEX starmap_bg_geoindex ON starmap_bg USING GIST (the_geom)');
	await knex.raw('CREATE INDEX starmap_object_geoindex ON starmap_object USING GIST (the_geom)');
};

exports.down = async knex => {
	await knex.raw('DROP INDEX IF EXISTS starmap_bg_geoindex');
	await knex.raw('DROP INDEX IF EXISTS starmap_object_geoindex');
	await knex.raw('DROP INDEX IF EXISTS ship_geoindex');

	await knex.raw('DROP VIEW IF EXISTS starmap_object_star');
	await knex.raw('DROP VIEW IF EXISTS starmap_object_visible');
	await knex.raw('DROP VIEW IF EXISTS starmap_fleet');
	await knex.raw('DROP VIEW IF EXISTS starmap_jump_range');

	await knex.raw('DROP TABLE IF EXISTS grid_action');
	await knex.raw('DROP TABLE IF EXISTS starmap_bg');
	await knex.raw('DROP TABLE IF EXISTS starmap_object');

	await knex.schema.table('ship', t => {
		t.dropColumn('the_geom');
		t.dropColumn('class');
		t.dropColumn('type');
	});
};
