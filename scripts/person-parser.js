const csv = require('csvtojson');
const path = require('path');
const { pick, pickBy, forIn, get, omit } = require('lodash');

const dataPath = path.join(__dirname, '../db/data');

// Hold all created IDs here so we can check for duplicates
const generatedCardIds = new Set([]);

// Hold all character relations here with character ID as key
const allCharacterRelationsMap = new Map();

// Used for mapping a character name to character ID for family relations
const allCharactersNameToIdMap = new Map();

const allCharacterEntries = [];

const characterFields = {
	id: null,
	bio_id: null,
	card_id: null,
	is_character: null,
	first_name: null,
	last_name: null,
	title: null,
	birth_year: null,
	citizen_id: null,
	status: null,
	home_planet: null,
	religion: null,
	citizenship: null,
	ship_id: null,
	social_class: null,
	dynasty: null,
	political_party: null,
	military_rank: null,
	occupation: null,
	military_remarks: null,
	medical_fitness_level: null,
	medical_last_fitness_check: null,
	medical_blood_type: null,
	medical_allergies: null,
	medical_active_conditions: null,
	medical_current_medication: null,
	created_year: null,
	is_visible: null,
};

function generateCardId() {
	const chars = '0123456789'.split('');
	const length = 6;
	let id = [...Array(length)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
	if (generatedCardIds.has(id)) id = generateCardId();
	generatedCardIds.add(id);
	return id;
}

function getFullName({ first_name, last_name }) {
	return `${first_name}${last_name ? last_name : ''}`;
}

function parseCharacterRelations(characters) {
	const relations = [];
	allCharacterRelationsMap.forEach((value, key) => {
		const person1_id = key;
		value.forEach(({ relation, relationName, characterName }) => {
			const person2_id = allCharactersNameToIdMap.get(relationName);
			if (person2_id) relations.push({ person1_id, person2_id, relation });
			else {
				console.warn(`Character "${characterName}" (#${key}) has a missing relative "${relationName}" (${relation})`);
			}
		});
	});
	return relations;
}

async function parseSurvivors() {
	const survivorsCsvPath = path.join(dataPath, 'survivors.csv');
	const survivors = (await csv().fromFile(survivorsCsvPath)).map((s, id) => ({
		...characterFields,
		id: String(id + 1),
		...pick(s, ['first_name', 'last_name', 'dynasty', 'ship_id', 'status', 'home_planet']),
		is_visible: s.is_visible === 'TRUE'
	}));
	survivors.forEach(c => allCharactersNameToIdMap.set(getFullName(c), c.id));
	return survivors;
}

function characterRelationsToMap(characterId, relations, characterName) {
	const characterRelations = [];
	const names = pickBy(relations, (value, key) => !!key.match(/^[0-9]*_name$/));
	forIn(names, (relationName, key) => {
		const relation = get(relations, key.replace('_name', '_relationship'));
		characterRelations.push({ relation, relationName, characterName });
	});
	allCharacterRelationsMap.set(characterId, characterRelations);
}

function parseCharacterEntries(c) {
	const { personal_file, medical_records, military_service_history } = c;
	const entry = { person_id: c.id };
	if (personal_file) allCharacterEntries.push({ ...entry, type: 'PERSONAL', entry: personal_file });
	if (medical_records) allCharacterEntries.push({ ...entry, type: 'MEDICAL', entry: medical_records });
	if (military_service_history)
		allCharacterEntries.push({ ...entry, type: 'MILITARY', entry: military_service_history });
}

function parseCharacterData(c) {
	const { id } = c;
	const fullName = getFullName(c);

	// Parse character family relations
	const characterRelations = pickBy(c, (value, key) => key.match(/^[0-9]*_/) && !!value);
	if (Object.keys(characterRelations).length) characterRelationsToMap(id, characterRelations, fullName);

	// Parse character entries
	parseCharacterEntries(c);

	// Set character name/id to map so that character ID can be fetched by using full name
	// when parsing character family relations
	allCharactersNameToIdMap.set(fullName, id);

	// Parse ship_id from ship name
	let ship_id = c.ship_id.replace(/^[A-Z]SS /, '').toLowerCase();
	if (ship_id === 'none') ship_id = null;

	return omit({
		...characterFields,
		...pickBy(c, (value, key) => !key.match(/^[0-9]*_/) && !!value),
		birth_year: parseInt(c.birth_year, 10) || null,
		medical_last_fitness_check: parseInt(c.medical_last_fitness_check, 10) || null,
		created_year: parseInt(c.created_year, 10) || null,
		ship_id,
		bio_id: generateCardId(),
		card_id: generateCardId(),
		is_character: c.is_character === 'TRUE',
		is_visible: c.is_visible === 'TRUE'
	},
	// Omit the columns that will be saved in the person_entry table
	['military_service_history', 'personal_file', 'medical_records']);
}

async function parseCharacters() {
	const charactersCsvPath = path.join(dataPath, 'characters.csv');
	const characters = (await csv().fromFile(charactersCsvPath)).map(parseCharacterData);
	return characters;
}

async function parseData() {
	const survivors = await parseSurvivors();
	const characters = await parseCharacters();
	const characterRelations = parseCharacterRelations(characters);
	return { survivors, characters, characterRelations, characterEntries: allCharacterEntries };
}

module.exports = { parseData };