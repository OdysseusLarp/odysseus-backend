import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('story_messages', (table) => {
		table.increments('id').primary();
		table.string('name').notNullable();
		table
			.string('sender_person_id')
			.nullable()
			.references('id')
			.inTable('person')
			.onDelete('CASCADE');
		// Types:
		// Datahub message types: Text NPC, EVA, Hints for scientist, Fleet Coms, Fleet Secretary, Fleet Admiral
		// Ship log messages
		// News (Posted to Datahub)
		table.string('type').notNullable();
		// The plot takes place after this jump number
		table.integer('after_jump').nullable();
		// If set to true, the plot should happen exactly at the jump number in "after_jump"
		table.boolean('locked').notNullable().defaultTo(false);
		// Possible 'sent' values:
		// Yes, No need, Not yet, Repeatable
		table.string('sent').notNullable().defaultTo('Not yet');
		table.text('message').notNullable();
		table.text('gm_notes').nullable();
	});

	await knex.schema.createTable('story_person_messages', (table) => {
		table
			.string('person_id')
			.notNullable()
			.references('id')
			.inTable('person')
			.onDelete('CASCADE');
		table
			.integer('message_id')
			.notNullable()
			.references('id')
			.inTable('story_messages')
			.onDelete('CASCADE');
		table.primary(['person_id', 'message_id']);
	});

	await knex.schema.createTable('story_plot_messages', (table) => {
		table
			.integer('plot_id')
			.notNullable()
			.references('id')
			.inTable('story_plots')
			.onDelete('CASCADE');
		table
			.integer('message_id')
			.notNullable()
			.references('id')
			.inTable('story_messages')
			.onDelete('CASCADE');
		table.primary(['plot_id', 'message_id']);
	});

	await knex.schema.createTable('story_event_messages', (table) => {
		table
			.integer('event_id')
			.notNullable()
			.references('id')
			.inTable('story_events')
			.onDelete('CASCADE');
		table
			.integer('message_id')
			.notNullable()
			.references('id')
			.inTable('story_messages')
			.onDelete('CASCADE');
		table.primary(['event_id', 'message_id']);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('story_event_messages');
	await knex.schema.dropTableIfExists('story_plot_messages');
	await knex.schema.dropTableIfExists('story_person_messages');

	await knex.schema.dropTableIfExists('story_messages');
}
