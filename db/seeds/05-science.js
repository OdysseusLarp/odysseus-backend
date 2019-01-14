
const artifacts = [
	{
		id: 1,
		name: 'Shadowmourne'
	},
	{
		id: 2,
		name: 'Rubber Duck'
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
		person_id: '593203',
		is_visible: true
	},
	{
		artifact_id: 2,
		text: `X-Ray pictures show that there is something inside the duck.`,
		discovered_by: 'HANSCA_XRAY',
		person_id: '593203',
		is_visible: true
	}
];

exports.seed = async knex => {
	await knex('artifact_research').del();
	await knex('artifact').del();
	await knex('artifact').insert(artifacts);
	await knex('artifact_research').insert(artifactResearch);
};
