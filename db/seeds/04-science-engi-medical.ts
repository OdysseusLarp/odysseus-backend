import csv from "csvtojson";
import path from "path";
import { isEmpty, get } from "lodash";
import { Knex } from "knex";

async function getArtifacts() {
	const csvPath = path.join(__dirname, '../data/artifacts.csv');
	const rawArtifacts = await csv().fromFile(csvPath);

	const artifactEntries: unknown[] = [];
	const artifactColumns = ['catalog_id', 'name', 'discovered_at', 'discovered_by', 'discovered_from', 'type', 'text', 'test_material','test_microscope', 'test_age', 'test_history', 'test_xrf', 'gm_notes', 'is_visible'];
	const artifacts: unknown[] = rawArtifacts.map((artifact, i) => {
		const id = i + 1;
		artifact.id = id;
		artifact.test_age = parseInt(artifact.test_age, 10);
		artifactColumns.forEach(col => {
			if (!artifact[col]) delete artifact[col];
		});
		if ('entry' in artifact && !isEmpty(artifact.entry)) {
			artifactEntries.push({
				artifact_id: id,
				entry: artifact.entry.trim(),
			});
		}
		delete artifact.entry;
		return artifact;
	});
	return { artifacts, artifactEntries };
}

async function getTags() {
	const csvPath = path.join(__dirname, '../data/tags.csv');
	const rawTags = await csv().fromFile(csvPath);

	const tags = rawTags.map(tag => ({
		id: get(tag, 'tag_id', '').trim(),
		type: get(tag, 'type', '').toUpperCase().trim(),
		description: get(tag, 'description', '').trim(),
	})).filter(tag => tag.id && tag.type && tag.description);
	return tags;
}

export const seed = async (knex: Knex) => {
	const { artifacts, artifactEntries } = await getArtifacts();
	await knex('artifact_entry').del();
	await knex('artifact').del();
	await knex('tag').del();
	await knex('tag').insert(await getTags());
	await knex('artifact').insert(artifacts);
	await knex('artifact_entry').insert(artifactEntries);
	await knex.raw(`SELECT setval('artifact_id_seq', ${artifacts.length + 1})`);
};
