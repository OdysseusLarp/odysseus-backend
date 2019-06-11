
const artifacts = [
	{
		id: 1,
		name: 'Shadowmourne',
		catalog_id: 'ABC123'
	},
	{
		id: 2,
		name: 'Rubber Duck',
		catalog_id: 'DEF456'
	}
];

const artifactResearch = [
	{
		artifact_id: 1,
		discovered_by: 'DEFAULT', // Default initial data
		text: `Scary looking axe that requires further analysis.`,
		is_visible: true
	},
	{
		artifact_id: 1,
		text: `Looks like it was once used by a gladiator in another universe.`,
		is_visible: false
	},
	{
		artifact_id: 2,
		text: `Duck says quack.`,
		discovered_by: 'DEFAULT', // Default initial data
		is_visible: true
	},
	{
		artifact_id: 2,
		text: `DNA Test indicates that the duck is indeed made of rubber.`,
		discovered_by: 'HANSCA_DNA',
		person_id: '20000',
		is_visible: true
	},
	{
		artifact_id: 2,
		text: `X-Ray pictures show that there is something inside the duck.`,
		discovered_by: 'HANSCA_XRAY',
		person_id: '20001',
		is_visible: true
	}
];

const tags = [
	{
		id: 'TAG001',
		type: 'DIAGNOSIS',
		description: 'Seems like this hand is broken.',
		metadata: null
	},
	{
		id: 'TAG002',
		type: 'DIAGNOSIS',
		description: 'Smells like blood poisoning.',
		metadata: null
	},
	{
		id: 'TAG003',
		type: 'ENGINEERING', // Some generic engineering tag
		description: 'Not sure about this',
		metadata: null
	}
];

exports.seed = async knex => {
	await knex('artifact_research').del();
	await knex('artifact').del();
	await knex('tag').del();
	await knex('tag').insert(tags);
	await knex('artifact').insert(artifacts);
	await knex('artifact_research').insert(artifactResearch);
};
