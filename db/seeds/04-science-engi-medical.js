const csv = require('csvtojson');
const path = require('path');
const { isEmpty } = require('lodash');

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

exports.seed = async knex => {
	const { artifacts, artifactEntries } = await getArtifacts();
	await knex('artifact_entry').del();
	await knex('artifact').del();
	await knex('tag').del();
	// await knex('tag').insert(tags);
	await knex('artifact').insert(artifacts);
	await knex('artifact_entry').insert(artifactEntries);
	await knex.raw(`SELECT setval('artifact_id_seq', ${artifacts.length + 1})`);
};
