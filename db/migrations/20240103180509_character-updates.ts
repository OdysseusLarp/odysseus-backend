import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('person', (table) => {
		table.text('link_to_character').nullable();
		table.text('summary').nullable();
		table.text('gm_notes').nullable();
		table.text('shift').nullable();
		table.text('role').nullable();
		table.text('role_additional').nullable();
		table.text('special_group').nullable();
		table.text('character_group').nullable();
		table.boolean('medical_elder_gene').defaultTo(false);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('person', (table) => {
		table.dropColumn('link_to_character');
		table.dropColumn('summary');
		table.dropColumn('gm_notes');
		table.dropColumn('shift');
		table.dropColumn('role');
		table.dropColumn('role_additional');
		table.dropColumn('special_group');
		table.dropColumn('character_group');
		table.dropColumn('medical_elder_gene');
	});
}
