exports.up = async knex => {
	await knex.raw('DROP TABLE IF EXISTS event');

	await knex.schema.createTable('event', t => {
		t.increments('id').primary();
		// TODO: make type into enum once all types are known
		// e.g. JUMP, SEND_PROBE, CALIBRATE
		t.string('type').notNullable();
		// TODO: make status into enum once all statuses are known
		// e.g. PENDING, COMPLETED, CANCELLED
		t.string('status').notNullable();
		t.string('ship_id').references('id').inTable('ship');
		t.timestamp('occurs_at');
		// Any data related to the event
		t.json('metadata');
		t.boolean('is_active').defaultTo(true);
		t.timestamps(true, true);
		t.index(['ship_id', 'type', 'occurs_at', 'is_active']);
	});
};

exports.down = async knex => {
	await knex.raw('DROP TABLE IF EXISTS event');
};
