import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('infoboard_entry', table => {
		table.string('identifier').nullable().unique();
		table.jsonb('metadata').nullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('infoboard_entry', table => {
		table.dropColumn('metadata');
		table.dropColumn('identifier');
	});
}
