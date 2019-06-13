const artifacts = [
	{
		id: 1,
		name: 'Shadowmourne',
		catalog_id: 'ABC123',
		discovered_by: 'Some guy',
		discovered_at: 'Some planet',
		discovered_from: 'What is this field even',
		type: 'Alien artifact',
		text: 'Some sort of an axe'
	},
	{
		id: 2,
		name: 'Rubber Duck',
		catalog_id: 'DEF456',
		discovered_by: 'Some other guy',
		discovered_at: 'Some other planet',
		discovered_from: 'What is this field even still',
		type: 'Alien artifact',
		text: 'Yellow duck'
	}
];

const artifactEntry = [
	{
		artifact_id: 1,
		person_id: '20000',
		entry: `Scary looking axe that requires further analysis.`,
	},
	{
		artifact_id: 1,
		person_id: '20000',
		entry: `Looks like it was once used by a gladiator in another universe.`,
	},
	{
		artifact_id: 2,
		person_id: '20000',
		entry: `Duck says quack.`,
	},
	{
		artifact_id: 2,
		entry: `DNA Test indicates that the duck is indeed made of rubber.`,
		person_id: '20000',
	},
	{
		artifact_id: 2,
		entry: `X-Ray pictures show that there is something inside the duck.`,
		person_id: '20001',
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
	await knex('artifact_entry').del();
	await knex('artifact').del();
	await knex('tag').del();
	await knex('tag').insert(tags);
	await knex('artifact').insert(artifacts);
	await knex('artifact_entry').insert(artifactEntry);
	await knex.raw(`SELECT setval('artifact_id_seq', 3)`);
};
