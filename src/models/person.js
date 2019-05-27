import Bookshelf from '../../db';
import { Ship } from './ship';

/* eslint-disable object-shorthand */

/**
 * @typedef Entry
 * @property {integer} id - Incrementing integer used as primary key
 * @property {string} type - Entry type, e.g. - MILITARY, PERSONAL, MEDICAL
 * @property {string} entry - Entry content
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Entry = Bookshelf.Model.extend({
	tableName: 'person_entry',
	hasTimestamps: true,
});

const withRelated = [
	'entries',
	'family',
	'ship'
];

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
			return `${this.get('first_name')} ${this.get('last_name')}`;
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
	fetchAllWithRelated: function () {
		return this.fetchAll({ withRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated });
	},
	search: function (name) {
		return this.query(qb =>
			qb.whereRaw(`LOWER(CONCAT(first_name, ' ', last_name)) LIKE ?`, [`%${name}%`])
		).fetchAll();
	}
});
