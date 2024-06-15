import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('infoboard_entry', (table) => {
		table.timestamp('active_until').nullable();
	});
}


export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('infoboard_entry', (table) => {
		table.dropColumn('active_until');
	});
}