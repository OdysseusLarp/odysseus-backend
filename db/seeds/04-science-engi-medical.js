const csv = require('csvtojson');
const path = require('path');
const { isEmpty, get } = require('lodash');

async function getArtifacts() {
	const csvPath = path.join(__dirname, '../data/artifacts.csv');
	const rawArtifacts = await csv().fromFile(csvPath);

	const artifactEntries = [];
	const artifacts = rawArtifacts.map((artifact, i) => {
		const id = i + 1;
		artifact.id = id;
		['catalog_id', 'name', 'discovered_at', 'discovered_by', 'discovered_from', 'type', 'text'].forEach(col => {
			if (!artifact[col]) delete artifact[col];
		});
		if ('entry' in artifact && !isEmpty(artifact.entry)) {
			artifactEntries.push({
				artifact_id: id,
				entry: artifact.entry
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

exports.seed = async knex => {
	const { artifacts, artifactEntries } = await getArtifacts();
	await knex('artifact_entry').del();
	await knex('artifact').del();
	await knex('tag').del();
	await knex('tag').insert(await getTags());
	await knex('artifact').insert(artifacts);
	await knex('artifact_entry').insert(artifactEntries);
	await knex.raw(`SELECT setval('artifact_id_seq', ${artifacts.length + 1})`);
};
