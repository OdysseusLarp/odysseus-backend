const { chunk } = require('lodash');
const { parseData } = require('../../scripts/person-parser');

exports.seed = async knex => {
	await knex('artifact_entry').del();
	await knex('operation_result').del();
	await knex('sip_contact').del();
	await knex('person_group').del();
	await knex('person_entry').del();
	await knex('person_family').del();
	await knex('person').del();
	await knex('group').del();

	const {
		survivors,
		characters,
		groups,
		characterRelations,
		characterEntries,
		characterGroups
	} = await parseData();

	// Insert in chunks of 2000 persons as Knex seems to break otherwise
	await Promise.all(
		chunk(survivors, 2000)
			.map(survivorsChunk => knex('person').insert(survivorsChunk)));

	await knex('person').insert(characters);
	await knex('group').insert(groups);
	await knex('person_family').insert(characterRelations);
	await knex('person_entry').insert(characterEntries);
	await knex('person_group').insert(characterGroups);
	await knex('sip_contact').insert([
		{ id: '6001', name: 'Contact #6001', video_allowed: false },
		{ id: '6002', name: 'Contact #6002', video_allowed: false },
	]);
};
