import { knex } from '../../db';
import artifactDump from 'museum/data/artifact.json';
import postDump from 'museum/data/post.json';
import messageDump from 'museum/data/com_message.json';

/**
 * Update timestamps to the same difference from now as toBeUpdates is from referenceTime
 */
function updateTimestamp(toBeUpdated: string, referenceTime: string): string {
	const dateToBeUpdated = new Date(toBeUpdated);
	const dateReferenceTime = new Date(referenceTime);

	const difference = dateReferenceTime.getTime() - dateToBeUpdated.getTime();
	const now = Date.now();
	const updatedTime = now - difference;

	return new Date(updatedTime).toISOString();
}

async function resetTable(
	tableName: string,
	data: Array<Record<string, any>>,
	updateTimeField: string | undefined = undefined,
	referenceTime: string | undefined = undefined
) {
	let updatedData: Array<Record<string, any>>;
	if (updateTimeField && referenceTime) {
		updatedData = data.map(row => ({
			...row,
			[updateTimeField]: updateTimestamp(row[updateTimeField], referenceTime),
		}));
	} else {
		updatedData = data;
	}
	await knex(tableName).del();
	await knex(tableName).insert(updatedData);
}

export async function resetMuseumDatabase() {
	await resetTable('artifact', artifactDump);
	await resetTable('post', postDump, 'created_at', '2024-07-05 01:37:00.000+03');
	await resetTable('com_message', messageDump, 'created_at', '2025-01-22 20:00:00+02');
}
