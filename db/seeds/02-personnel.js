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

	const sipContacts = [
		{ name: 'Bridge Comms 1', id: '6001', video_allowed: true, is_visible: true, type: 'PERSONAL' },
		{ name: 'Bridge Comms 2', id: '6002', video_allowed: true, is_visible: true, type: 'PERSONAL' },
		{ name: 'Engineering', id: '6003', video_allowed: false, is_visible: true, type: 'PERSONAL' },
		{ name: 'Crew bar', id: '6004', video_allowed: false, is_visible: true, type: 'PERSONAL' },
		{ name: 'Medical', id: '6005', video_allowed: false, is_visible: true, type: 'PERSONAL' },
		{ name: 'Science lab', id: '6006', video_allowed: false, is_visible: true, type: 'PERSONAL' },
		{ name: 'Captains room', id: '6007', video_allowed: true, is_visible: true, type: 'PERSONAL' },
		{ name: 'War room', id: '6008', video_allowed: true, is_visible: true, type: 'PERSONAL' },
		{ name: 'Security', id: '6009', video_allowed: false, is_visible: true, type: 'PERSONAL' },
		{ name: 'Hangar bay', id: '6010', video_allowed: false, is_visible: true, type: 'PERSONAL' },
		{ name: 'Fighter 1', id: '6011', video_allowed: false, is_visible: false, type: 'PERSONAL' },
		{ name: 'Fighter 2', id: '6012', video_allowed: false, is_visible: false, type: 'PERSONAL' },
		{ name: 'Fighter 3', id: '6013', video_allowed: false, is_visible: false, type: 'PERSONAL' },
		{ name: 'Fighter 4', id: '6014', video_allowed: false, is_visible: false, type: 'PERSONAL' },
		{ name: 'Fighter 5', id: '6015', video_allowed: false, is_visible: false, type: 'PERSONAL' },
		{ name: 'Fighter 6', id: '6016', video_allowed: false, is_visible: false, type: 'PERSONAL' },
		{ name: 'Big Screen', id: '6017', video_allowed: true, is_visible: false, type: 'PERSONAL' },
		{ name: 'Land team', id: '6018', video_allowed: true, is_visible: false, type: 'PERSONAL' },
		{ name: 'Fleet Secretary 1 ', id: '6019', video_allowed: true, is_visible: false, type: 'PERSONAL' },
		{ name: 'Fleet Secretary 2 ', id: '6020', video_allowed: true, is_visible: false, type: 'PERSONAL' },
		{ name: 'Fleet Secretary 3 ', id: '6021', video_allowed: true, is_visible: false, type: 'PERSONAL' },
		{ name: 'Fleet Secretary (Conference)', id: '4001', video_allowed: false, is_visible: true, type: 'CONFERENCE' },
		{ name: 'Fighters (Conference)', id: '4002', video_allowed: false, is_visible: true, type: 'CONFERENCE' },
	];
	await knex('sip_contact').insert(sipContacts);
};
