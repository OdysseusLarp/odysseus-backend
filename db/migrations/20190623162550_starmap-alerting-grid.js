exports.up = async knex => {
	await knex.raw(`DROP VIEW IF EXISTS starmap_grid_alert`);
	await knex.raw(`CREATE VIEW starmap_grid_alert AS
		SELECT grid.id, grid.name, grid.the_geom
			FROM starmap_beacon beacon
			JOIN grid ON (grid.id = beacon.grid_id)
			WHERE is_active = TRUE
		`);
};

exports.down = async knex => {
	await knex.raw(`DROP VIEW IF EXISTS starmap_grid_alert`);
};
