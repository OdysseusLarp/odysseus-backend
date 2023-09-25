import Bookshelf, { knex } from '../../db';
import { Ship } from './ship';
import { forOwn } from 'lodash';

/* eslint-disable object-shorthand */

/**
 * @typedef Entry
 * @property {integer} id - Incrementing integer used as primary key
 * @property {string} type - Entry type, e.g. - MILITARY, PERSONAL, MEDICAL
 * @property {string} entry - Entry content
 * @property {integer} added_by - ID of the person who added the entry
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Entry = Bookshelf.Model.extend({
	tableName: 'person_entry',
	hasTimestamps: true,
	person: function () {
		return this.hasOne(Person);
	},
	added_by: function () {
		return this.hasOne(Person, 'id', 'added_by');
	}
});

/**
 * @typedef Group
 * @property {string} id - Incrementing integer used as primary key
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Group = Bookshelf.Model.extend({
	tableName: 'group',
	hasTimestamps: true,
	// Serialize to just the group ID
	serialize: function () {
		return this.get('id');
	},
	persons: function () {
		return this.belongsToMany(Person, 'person_group');
	}
});

/**
 * @typedef BloodTestResult
 * @property {integer} id - Incrementing integer used as primary key
 * @property {string} person_id - ID of the person who this test result belongs to
 * @property {string} hemoglobin - Hemoglobin
 * @property {string} leukocytes - Leykocytes
 * @property {string} kalium - Kalium
 * @property {string} natrium - Natrium
 * @property {string} hcg - HCG
 * @property {string} acn_enzyme - ACN Enzyme
 * @property {string} sub_abuse - Is this person a junkie or not
 * @property {string} details - Any details
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const BloodTestResult = Bookshelf.Model.extend({
	tableName: 'person_blood_test_result',
	hasTimestamps: true,
	person: function () {
		return this.hasOne(Person);
	},
	fetchWithRelated() {
		this.fetch({ withRelated: ['person'] });
	}
});

const withRelated = [
	'entries',
	// 'family',
	'ship',
	'groups'
];

/**
 * @typedef PersonCollection
 * @property {Array.<Person>} persons - Array of persons
 * @property {integer} rowCount - Number of rows before pagination
 * @property {integer} pageCount - Number of pages
 * @property {integer} page - Page number
 * @property {integer} pageSize - Page size
 */

/**
 * @typedef Person
 * @property {string} id - Generated ID used in the system internally
 * @property {string} bio_id.required - Bio ID used for hard authentication
 * @property {string} card_id.required - Card ID used for soft authentication
 * @property {string} citizen_id - Citizen ID, like HETU, no real use
 * @property {string} first_name.required - First name
 * @property {string} last_name.required - Last name
 * @property {string} ship_id - ID of the current ship where the person is located
 * @property {string} title - Title
 * @property {string} status - Current status
 * @property {string} occupation - Occupation
 * @property {string} home_planet - Home planet
 * @property {string} dynasty - Dynasty that the player belongs to
 * @property {integer} birth_year - Birth year of the person
 * @property {string} religion - Religion
 * @property {string} citizenship - Citizenship status
 * @property {string} social_class - Social class
 * @property {string} political_party - Political party
 * @property {string} military_rank - Military rank
 * @property {string} occupation - Occupation
 * @property {string} military_remarks - Any previous military remarks
 * @property {string} medical_fitness_level - Fitness level
 * @property {integer} medical_last_fitness_check - Year when the last fitness check took place
 * @property {string} medical_blood_type - Blood type (single letter)
 * @property {string} medical_allergies - Any allergies
 * @property {string} medical_active_conditions - Any active medical conditions
 * @property {string} medical_current_medication - Any current medication
 * @property {string} created_year - When the person was inserted into the system
 * @property {string} is_visible - Is the person visible or not (have they been discovered)
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Person = Bookshelf.Model.extend({
	tableName: 'person',
	hasTimestamps: true,
	virtuals: {
		full_name: function () {
			const firstName = this.get('first_name');
			const lastName = this.get('last_name');
			return firstName + (lastName ? ` ${lastName}` : '');
		}
	},
	entries: function () {
		return this.hasMany(Entry);
	},
	family: function () {
		return this.belongsToMany(Person, 'person_family', 'person1_id', 'person2_id').withPivot(['relation']);
	},
	ship: function () {
		return this.belongsTo(Ship, 'ship_id', 'id');
	},
	groups: function () {
		return this.belongsToMany(Group, 'person_group');
	},
	fetchListPage: function ({ page, pageSize, showHidden, filters = {} }) {
		return this.query(qb => {
			if (!showHidden) qb.where('is_visible', true);
			if (filters.name) qb.whereRaw(`LOWER(CONCAT(first_name, ' ', last_name)) LIKE ?`, [`%${filters.name}%`]);
			forOwn(filters, (value, key) => {
				if (key === 'name') return;
				qb.where(key, value);
			});
			if (filters.is_character) {
				qb.where('is_character', '=', true);
			}
		}).orderBy('first_name', 'last_name').fetchPage({
			page,
			pageSize,
			columns: [
				'id',
				'first_name',
				'last_name',
				'dynasty',
				'ship_id',
				'status',
				'home_planet',
				'is_visible',
				'card_id'
			],
			withRelated: [{
				ship: qb => qb.column('id', 'name')
			}]
		});
	},
	fetchWithRelated: function () {
		return this.fetch({
			withRelated: [
				...withRelated,
				{ family: qb => qb.columns('id', 'first_name', 'last_name', 'ship_id', 'status', 'is_visible') },
				{ 'entries.added_by': qb => qb.columns('id', 'first_name', 'last_name') }
			]
		});
	},
	search: function (name, showHidden = false) {
		return this.query(qb => {
			qb.where('is_visible', !showHidden);
			qb.whereRaw(`LOWER(CONCAT(first_name, ' ', last_name)) LIKE ?`, [`%${name}%`]);
		}).fetchAll();
	},
	addToGroup: function (groupId) {
		return Bookshelf.knex.raw(
			`INSERT INTO person_group (person_id, group_id) VALUES (?, ?)`,
			[this.get('id'), groupId]
		);
	},
	deleteFromGroup: function (groupId) {
		return Bookshelf.knex.raw(
			`DELETE FROM person_group WHERE person_id = ? AND group_id = ?`,
			[this.get('id'), groupId]
		);
	},
	killPerson: function () {
		return knex.transaction(async trx => {
			await knex('person').transacting(trx).update({ status: 'Deceased' }).where('id', '=', this.get('id'));
			return knex('person_entry')
				.transacting(trx)
				.insert({
					person_id: this.get('id'),
					type: 'PERSONAL',
					entry: `542 - Deceased`,
					added_by: process.env.FLEET_SECRETARY_ID,
				});
		});
	}
});

/**
 * @typedef FilterItem
 * @property {string} name - Display value of the filter item
 * @property {string} value - Key value of the filter item
 */

/**
 * @typedef FilterCollection
 * @property {string} name - Name of the filter collection
 * @property {string} key - Key of the filter collection
 * @property {Array.<FilterItem>} items - Filter items
 */

/**
 * @typedef FilterValuesResponse
 * @property {Array.<FilterCollection>} filters - Array containing filter collections
 */


export async function getFilterableValues() {
	const { knex } = Bookshelf;
	const [titleItems, statusItems, dynastyItems, shipItems, homePlanetItems] = await Promise.all([
		knex('person').distinct('title').where('is_visible', true).whereRaw('title IS NOT NULL').orderBy('title'),
		knex('person').distinct('status').where('is_visible', true).whereRaw('status IS NOT NULL').orderBy('status'),
		knex('person').distinct('dynasty').where('is_visible', true).whereRaw('status IS NOT NULL').orderBy('dynasty'),
		knex('person').distinct('ship_id', 'ship.name')
			.join('ship', 'ship.id', 'person.ship_id').orderBy('ship_id')
			.where('person.is_visible', true).where('ship.is_visible', true).whereRaw('ship_id IS NOT NULL'),
		knex('person').distinct('home_planet').where('is_visible', true).whereRaw('home_planet IS NOT NULL')
			.orderBy('home_planet'),
	]);
	return {
		filters: [
			{
				name: 'Title',
				key: 'title',
				items: (titleItems || []).filter(s => s && s.title).map(({ title }) => ({
					name: title,
					value: title
				}))
			},
			{
				name: 'Dynasty',
				key: 'dynasty',
				items: (dynastyItems || []).filter(d => d && d.dynasty).map(({ dynasty }) => ({
					name: dynasty,
					value: dynasty
				}))
			},
			{
				name: 'Home planet',
				key: 'home_planet',
				items: (homePlanetItems || []).filter(s => s && s.home_planet).map(({ home_planet }) => ({
					name: home_planet,
					value: home_planet
				}))
			},
			{
				name: 'Current location',
				key: 'ship_id',
				items: (shipItems || []).filter(s => s && s.ship_id).map(({ name, ship_id }) => ({
					name,
					value: ship_id
				}))
			},
			{
				name: 'Status',
				key: 'status',
				items: (statusItems || []).filter(s => s && s.status).map(({ status }) => ({
					name: status,
					value: status
				}))
			},
		]
	};
}

export function setPersonsVisible() {
	const blacklistedIds = (process.env.PERMANENTLY_HIDDEN_PERSONS || '').split(',').map(s => s.trim());
	// TODO: Send ship log message?
	return Bookshelf.knex('person').where('id', 'not in', blacklistedIds).update({ is_visible: true });
}
