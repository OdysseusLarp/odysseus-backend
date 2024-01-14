import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('story_person_relations', (table) => {
		table.increments('id').primary();
		table
			.string('first_person_id')
			.nullable()
			.references('id')
			.inTable('person')
			.onDelete('CASCADE');
		table
			.string('second_person_id')
			.nullable()
			.references('id')
			.inTable('person')
			.onDelete('CASCADE');
		table.text('relation').nullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('story_person_relations');
}
