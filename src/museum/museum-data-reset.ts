import { knex } from '../../db';
import artifactDump from 'museum/data/artifact.json';

async function resetTable(tableName: string, data: any[]) {
	await knex(tableName).del();
	await knex(tableName).insert(data);
}

export async function resetMuseumDatabase() {
	await resetTable('artifact', artifactDump);
}
