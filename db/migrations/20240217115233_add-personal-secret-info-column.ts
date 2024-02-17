import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('person', (table) => {
		table.text('personal_secret_info').nullable();
	});
}


export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('person', (table) => {
		table.dropColumn('personal_secret_info');
	});
}
