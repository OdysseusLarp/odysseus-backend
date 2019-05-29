const { chunk } = require('lodash');
const { parseData } = require('../../scripts/person-parser');

exports.seed = async knex => {
	await knex('person_entry').del();
	await knex('person_family').del();
	await knex('person').del();

	const { survivors, characters, characterRelations, characterEntries } = await parseData();

	// Insert in chunks of 2000 persons as Knex seems to break otherwise
	await Promise.all(
		chunk(survivors, 2000)
			.map(survivorsChunk => knex('person').insert(survivorsChunk)));

	await knex('person').insert(characters);
	await knex('person_family').insert(characterRelations);
	await knex('person_entry').insert(characterEntries);
};
