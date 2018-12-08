exports.up = async knex => {
	await knex.raw('DROP TABLE IF EXISTS com_message');
	await knex.raw('DROP TABLE IF EXISTS com_channel_event');
	await knex.raw('DROP TABLE IF EXISTS com_channel');
	await knex.raw('DROP TABLE IF EXISTS post');

	// News, opinion pieces etc.
	await knex.schema.createTable('post', t => {
		t.increments('id').primary();
		t.string('title').notNullable();
		t.text('body').notNullable();
		// Author of the post
		t.string('person_id').references('id').inTable('person').onDelete('CASCADE');
		// Type: NEWS, OPINION etc.
		t.string('type').notNullable();
		t.boolean('is_visible').defaultTo(false).notNullable();
		t.timestamps(true, true);
		t.index(['title', 'person_id']);
	});

	// Chat channels
	await knex.schema.createTable('com_channel', t => {
		// id acts as channel name
		t.string('id').primary();
		t.string('description');
		t.timestamps(true, true);
	});

	// Chat channel join/leave events
	await knex.schema.createTable('com_channel_event', t => {
		t.increments('id').primary();
		t.string('type');
		t.json('metadata');
		t.timestamps(true, true);
		t.index(['created_at']);
	});

	// Chat messages
	await knex.schema.createTable('com_message', t => {
		t.increments('id').primary();
		t.string('person_id').references('id').inTable('person').onDelete('CASCADE');
		t.string('target_person').references('id').inTable('person').onDelete('CASCADE');
		t.string('target_channel').references('id').inTable('com_channel');
		t.text('message').notNullable();
		t.index(['person_id', 'target_person', 'target_channel']);
	});

	// Vote
	await knex.schema.createTable('vote', t => {
		t.increments('id').primary();
		// Person who created the vote
		t.string('person_id').references('id').inTable('person').onDelete('CASCADE');
		t.string('title').notNullable();
		t.text('description').notNullable();
		t.timestamp('active_until');
		t.boolean('is_active').defaultTo(false).notNullable();
		t.timestamps(true, true);
	});

	// Vote option
	await knex.schema.createTable('vote_option', t => {
		t.increments('id').primary();
		t.integer('vote_id').references('id').inTable('vote').onDelete('CASCADE');
		t.string('text').notNullable();
		t.timestamps(true, true);
	});

	// Vote entry
	await knex.schema.createTable('vote_entry', t => {
		t.string('person_id').references('id').inTable('person').onDelete('CASCADE');
		t.integer('vote_id').references('id').inTable('vote').onDelete('CASCADE');
		t.integer('vote_option_id').references('id').inTable('vote_option').onDelete('CASCADE');
		t.timestamps(true, true);
		t.primary(['person_id', 'vote_id']);
		t.index(['vote_option_id']);
	});
};

exports.down = async knex => {
	await knex.raw('DROP TABLE IF EXISTS vote_entry');
	await knex.raw('DROP TABLE IF EXISTS vote_option');
	await knex.raw('DROP TABLE IF EXISTS vote');
	await knex.raw('DROP TABLE IF EXISTS com_message');
	await knex.raw('DROP TABLE IF EXISTS com_channel_event');
	await knex.raw('DROP TABLE IF EXISTS com_channel');
	await knex.raw('DROP TABLE IF EXISTS post');
};
