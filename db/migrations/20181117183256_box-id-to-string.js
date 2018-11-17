exports.up = async knex => {
	await knex.raw('ALTER TABLE box ALTER COLUMN id TYPE VARCHAR(255) USING id::VARCHAR');
};

exports.down = async knex => {
	// Generate random numeric IDs for boxes on rollback
	await knex.raw(`CREATE SEQUENCE box_id_sequence_temporary OWNED BY box.id`);
	await knex.raw(`ALTER TABLE box ALTER COLUMN id TYPE INTEGER USING
		nextval('box_id_sequence_temporary')`);
	await knex.raw(`DROP SEQUENCE box_id_sequence_temporary`);
};
