import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('artifact', (table) => {
		table.text('gm_notes').nullable();
		table.boolean('is_visible').defaultTo(true).notNullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('artifact', (table) => {
		table.dropColumn('gm_notes');
		table.dropColumn('is_visible');
	});
}
