import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('artifact', (table) => {
		table.text('test_material').nullable();
		table.text('test_microscope').nullable();
		table.integer('test_age').nullable();
		table.text('test_history').nullable();
		table.text('test_xrf').nullable();
	});
}


export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('artifact', (table) => {
		table.dropColumn('test_material');
		table.dropColumn('test_microscope');
		table.dropColumn('test_age');
		table.dropColumn('test_history');
		table.dropColumn('test_xrf');
	});
}