import csv from 'csvtojson';
import path from 'path';
import { pick, pickBy, forIn, get, omit } from 'lodash';
import { parsedBoolean, parsedIntOrNull, trimmedStringOrNull } from './parsing';

/* eslint-disable no-console */

const dataPath = path.join(__dirname, '../../db/data');

// Hold all character relations here with character ID as key
const allCharacterRelationsMap = new Map();

// Used for mapping a character name to character ID for family relations
const allCharactersNameToIdMap = new Map();

// All valid ship IDs to help debugging invalid ship_id fields of persons
const ships = new Set();

const allCharacterEntries = [];
const characterGroups = [];

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
	military_academies: null,
	medical_fitness_level: null,
	medical_last_fitness_check: null,
	medical_blood_type: null,
	medical_allergies: null,
	medical_active_conditions: null,
	medical_current_medication: null,
	created_year: null,
	is_visible: null,
	link_to_character: null,
	summary: null,
	gm_notes: null,
	shift: null,
	role: null,
	role_additional: null,
	special_group: null,
	character_group: null,
	medical_elder_gene: null,
};

const groups = new Set([
	'role:medic',
	'role:security',
	'role:secret',
	'role:science',
	'role:engineer',
	'role:captain',
	'role:hacker',
	'role:admin',
	'skill:novice',
	'skill:master',
	'skill:expert',
]);

function getFullName({ first_name, last_name }) {
	return `${first_name} ${last_name ? last_name : ''}`.trim();
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

// Load Ship IDs to help debug invalid ship id entries of persons
async function parseShipIds() {
	const shipsCsvPath = path.join(dataPath, 'ship.csv');
	(await csv().fromFile(shipsCsvPath))
		.map(s => get(s, 'id'))
		.filter(Boolean)
		.forEach(shipId => ships.add(shipId));
}

async function parseSurvivors() {
	const survivorsCsvPath = path.join(dataPath, 'survivors.csv');
	const survivors = (await csv().fromFile(survivorsCsvPath)).map((s, id) => ({
		...characterFields,
		id: String(id + 1),
		card_id: `SURVIVOR-${String(id + 1)}`,
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
	if (personal_file) allCharacterEntries.push(
		{ ...entry, type: 'PERSONAL', entry: personal_file.replace(/\n/g, '\n\n') });
	if (medical_records) allCharacterEntries.push(
		{ ...entry, type: 'MEDICAL', entry: medical_records.replace(/\n/g, '\n\n') });
	if (military_service_history)
		allCharacterEntries.push({ ...entry, type: 'MILITARY', entry: military_service_history.replace(/\n/g, '\n\n') });
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
	let ship_id = c.ship_id.replace(/^[A-Z]SS /, '').toLowerCase().trim();
	if (!ship_id || ship_id === 'none' || ship_id === 'unknown') ship_id = null;
	if (ship_id && !ships.has(ship_id)) console.warn(`Character ${fullName} has an invalid ship_id ${ship_id}`);

	// Parse person groups
	forIn(c, (value, key) => {
		if (groups.has(key) && value === 'TRUE') characterGroups.push({ group_id: key, person_id: id });
	});

	// Columns that will be rendered as markdown need to have newlines replaced by two newlines
	let military_remarks = null;
	let medical_active_conditions = null;
	if (c.military_remarks) military_remarks = c.military_remarks.replace(/\n/g, '\n\n');
	if (c.medical_active_conditions) medical_active_conditions = c.medical_active_conditions.replace(/\n/g, '\n\n');

	return omit({
		...characterFields,
		...pickBy(c, (value, key) => !key.match(/^[0-9]*_/) && !!value && !groups.has(key)),
		birth_year: parsedIntOrNull(c.birth_year),
		medical_last_fitness_check: parsedIntOrNull(c.medical_last_fitness_check),
		created_year: parsedIntOrNull(c.created_year),
		ship_id,
		is_character: parsedBoolean(c.is_character),
		is_visible: parsedBoolean(c.is_visible),
		military_remarks,
		medical_active_conditions,
		link_to_character: trimmedStringOrNull(c.link_to_character),
		summary: trimmedStringOrNull(c.summary),
		gm_notes: trimmedStringOrNull(c.gm_notes),
		shift: trimmedStringOrNull(c.shift),
		role: trimmedStringOrNull(c.role),
		role_additional: trimmedStringOrNull(c.role_additional),
		special_group: trimmedStringOrNull(c.special_group),
		character_group: trimmedStringOrNull(c.character_group),
		medical_elder_gene: parsedBoolean(c.medical_elder_gene),
	},
	// Omit the columns that will be saved in the person_entry table
	['military_service_history', 'personal_file', 'medical_records']);
}

async function parseCharacters() {
	const charactersCsvPath = path.join(dataPath, 'characters.csv');
	const characters = (await csv().fromFile(charactersCsvPath)).map(parseCharacterData);
	return characters;
}

export async function parseData() {
	await parseShipIds();
	const survivors = await parseSurvivors();
	const characters = await parseCharacters();
	const characterRelations = parseCharacterRelations(characters);
	return {
		survivors,
		characters,
		characterRelations,
		characterGroups,
		characterEntries: allCharacterEntries,
		groups: Array.from(groups).map(id => ({ id })),
	};
}

module.exports = { parseData };
