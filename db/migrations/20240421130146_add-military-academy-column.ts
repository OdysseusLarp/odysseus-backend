import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('person', (table) => {
		table.text('military_academies').nullable();
	});
}


export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('person', (table) => {
		table.dropColumn('military_academies');
	});
}