// Copied from migration 20181219174555_starmap-objects.js
const createStarMapJumpRangeViewSql = `
CREATE VIEW starmap_jump_range AS SELECT
	ST_Buffer(
		(SELECT the_geom FROM grid WHERE id = grid_id),
		(ST_Perimeter(
			(SELECT the_geom FROM grid WHERE id = grid_id))
			/ 4
			* (SELECT (metadata->>'jump_range')::float FROM ship WHERE id = 'odysseus')
		), 'join=mitre endcap=square') AS the_geom
	FROM ship WHERE id = 'odysseus';
`;

exports.up = async knex => {
	// We have to drop and recreate the view because the column type changed
	await knex.raw('DROP VIEW IF EXISTS starmap_jump_range');

	await knex.raw(`ALTER TABLE audit_log ALTER COLUMN metadata SET DATA TYPE jsonb`);
	await knex.raw(`ALTER TABLE box ALTER COLUMN value SET DATA TYPE jsonb`);
	await knex.raw(`ALTER TABLE com_channel_event ALTER COLUMN metadata SET DATA TYPE jsonb`);
	await knex.raw(`ALTER TABLE event ALTER COLUMN metadata SET DATA TYPE jsonb`);
	await knex.raw(`ALTER TABLE operation_result ALTER COLUMN metadata SET DATA TYPE jsonb`);
	await knex.raw(`ALTER TABLE ship ALTER COLUMN metadata SET DATA TYPE jsonb`);
	await knex.raw(`ALTER TABLE ship_log ALTER COLUMN metadata SET DATA TYPE jsonb`);
	await knex.raw(`ALTER TABLE store ALTER COLUMN data SET DATA TYPE jsonb`);
	await knex.raw(`ALTER TABLE tag ALTER COLUMN metadata SET DATA TYPE jsonb`);

	await knex.raw(createStarMapJumpRangeViewSql);
};

exports.down = async knex => {
	// We have to drop and recreate the view because the column type changed
	await knex.raw('DROP VIEW IF EXISTS starmap_jump_range');

	await knex.raw(`ALTER TABLE audit_log ALTER COLUMN metadata SET DATA TYPE json`);
	await knex.raw(`ALTER TABLE box ALTER COLUMN value SET DATA TYPE json`);
	await knex.raw(`ALTER TABLE com_channel_event ALTER COLUMN metadata SET DATA TYPE json`);
	await knex.raw(`ALTER TABLE event ALTER COLUMN metadata SET DATA TYPE json`);
	await knex.raw(`ALTER TABLE operation_result ALTER COLUMN metadata SET DATA TYPE json`);
	await knex.raw(`ALTER TABLE ship ALTER COLUMN metadata SET DATA TYPE json`);
	await knex.raw(`ALTER TABLE ship_log ALTER COLUMN metadata SET DATA TYPE json`);
	await knex.raw(`ALTER TABLE store ALTER COLUMN data SET DATA TYPE json`);
	await knex.raw(`ALTER TABLE tag ALTER COLUMN metadata SET DATA TYPE json`);

	await knex.raw(createStarMapJumpRangeViewSql);
};
