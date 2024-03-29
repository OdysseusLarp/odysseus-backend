import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('story_events', (table) => {
		table.increments('id').primary();
		table.text('name').notNullable();
		table.text('character_groups').nullable();
		table.string('size').nullable();
		table.string('importance').nullable();
		table.integer('dmx_event_num').nullable();
		table.string('type').nullable();
		table.text('gm_actions').nullable();
		// The plot takes place after this jump number
		table.integer('after_jump').nullable();
		// If set to true, the plot should happen exactly at the jump number in "after_jump"
		table.boolean('locked').defaultTo(false).notNullable();
		table.string('status').nullable();
		table.text('npc_location').nullable();
		table.integer('npc_count').notNullable().defaultTo(0);
		table.text('description').nullable();
		table.text('gm_note_npc').nullable();
		table.text('gm_notes').nullable();
	});

	// joining table for characters to events
	await knex.schema.createTable('story_person_events', (table) => {
		table
			.string('person_id')
			.notNullable()
			.references('id')
			.inTable('person')
			.onDelete('CASCADE');
		table
			.integer('event_id')
			.notNullable()
			.references('id')
			.inTable('story_events')
			.onDelete('CASCADE');
		table.primary(['person_id', 'event_id']);
	});

	// joining table for artifacts to events
	await knex.schema.createTable('story_artifact_events', (table) => {
		table
			.integer('artifact_id')
			.notNullable()
			.references('id')
			.inTable('artifact')
			.onDelete('CASCADE');
		table
			.integer('event_id')
			.notNullable()
			.references('id')
			.inTable('story_events')
			.onDelete('CASCADE');
		table.primary(['artifact_id', 'event_id']);
	});

	await knex.schema.createTable('story_plots', (table) => {
		table.increments('id').primary();
		table.text('name').notNullable();
		table.text('character_groups').nullable(); // comma separated list of character groups
		table.string('size').nullable();
		table.text('themes').nullable();
		table.string('importance').nullable();
		table.text('gm_actions').nullable();
		// If true, a GM needs to send the initial message to the player
		table.boolean('text_npc_first_message').defaultTo(false).notNullable();
		// The plot takes place after this jump number
		table.integer('after_jump').nullable();
		// If set to true, the plot should happen exactly at the jump number in "after_jump"
		table.boolean('locked').defaultTo(false).notNullable();
		table.text('description').nullable();
		table.text('gm_notes').nullable();
		table.text('copy_from_characters').nullable();
	});

	// character_ids need to be linked to person_plots
	await knex.schema.createTable('story_person_plots', (table) => {
		table
			.string('person_id')
			.notNullable()
			.references('id')
			.inTable('person')
			.onDelete('CASCADE');
		table
			.integer('plot_id')
			.notNullable()
			.references('id')
			.inTable('story_plots')
			.onDelete('CASCADE');
		table.primary(['person_id', 'plot_id']);
	});

	// artifact_ids need to be linked to person_plots
	await knex.schema.createTable('story_artifact_plots', (table) => {
		table
			.integer('artifact_id')
			.notNullable()
			.references('id')
			.inTable('artifact')
			.onDelete('CASCADE');
		table
			.integer('plot_id')
			.notNullable()
			.references('id')
			.inTable('story_plots')
			.onDelete('CASCADE');
		table.primary(['artifact_id', 'plot_id']);
	});

	// create a joining table for events to plots
	await knex.schema.createTable('story_event_plots', (table) => {
		table
			.integer('event_id')
			.notNullable()
			.references('id')
			.inTable('story_events')
			.onDelete('CASCADE');
		table
			.integer('plot_id')
			.notNullable()
			.references('id')
			.inTable('story_plots')
			.onDelete('CASCADE');
		table.primary(['event_id', 'plot_id']);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('story_event_plots');
	await knex.schema.dropTableIfExists('story_artifact_plots');
	await knex.schema.dropTableIfExists('story_person_plots');
	await knex.schema.dropTableIfExists('story_artifact_events');
	await knex.schema.dropTableIfExists('story_person_events');

	await knex.schema.dropTableIfExists('story_plots');
	await knex.schema.dropTableIfExists('story_events');
}
