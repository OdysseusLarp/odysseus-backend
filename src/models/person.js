import Bookshelf from '../../db';

/* eslint-disable object-shorthand */

/**
 * @typedef {object} MedicalData
 * @property {string} person_id.required - Citizen ID of the person that the data belongs to
 * @property {string} blood_type - Blood type
 * @property {string} medication - Medication
 * @property {string} immunization - Immunization
 * @property {string} allergies - Allergies
 * @property {string} medical_history - Medical history
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const MedicalData = Bookshelf.Model.extend({
	tableName: 'person_medical_data',
	idAttribute: 'person_id',
	hasTimestamps: true,
});

/**
 * @typedef {object} MedicalEntry
 * @property {integer} id.required - Incrementing integer used as primary key,
 * linked to person_id in joining table person_medical_entry
 * @property {string} time - Time
 * @property {string} details - Details
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const MedicalEntry = Bookshelf.Model.extend({
	tableName: 'medical_entry',
	hasTimestamps: true,
});

/**
 * @typedef {object} MilitaryData
 * @property {string} person_id.required - Citizen ID of the person that the data belongs to
 * @property {string} rank - Military rank
 * @property {string} unit - Military unit
 * @property {string} remarks - Any remarks
 * @property {string} service_history - Military service history
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const MilitaryData = Bookshelf.Model.extend({
	tableName: 'person_military_data',
	idAttribute: 'person_id',
	hasTimestamps: true
});

const withRelated = [
	'medical_data',
	'medical_entries',
	'military_data',
	'family'
];

/**
 * @typedef {object} Person
 * @property {string} id.required - Citizen ID used for soft authentication
 * @property {string} chip_id.required - Chip ID used for hard authentication
 * @property {string} first_name.required - First name
 * @property {string} last_name.required - Last name
 * @property {string} current_ship - Current ship where the person is located
 * @property {string} previous_ship - Previous ship where the person was located
 * @property {string} title - Title
 * @property {string} status - Current status
 * @property {string} occupation - Occupation
 * @property {string} home_planet.required - Home planet
 * @property {string} dynasty - Dynasty that the player belongs to
 * @property {string} dynasty_rank - Rank of the person in their dynasty
 * @property {integer} birth_year.required - Birth year of the person
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Person = Bookshelf.Model.extend({
	tableName: 'person',
	hasTimestamps: true,
	medical_data: function () {
		return this.belongsTo(MedicalData, 'id', 'person_id');
	},
	medical_entries: function () {
		return this.belongsToMany(MedicalEntry, 'person_medical_entry', 'person_id', 'entry_id');
	},
	military_data: function () {
		return this.belongsTo(MilitaryData, 'id', 'person_id');
	},
	family: function () {
		return this.belongsToMany(Person, 'person_family', 'person1_id', 'person2_id').withPivot(['relation']);
	},
	fetchAllWithRelated: function () {
		return this.fetchAll({ withRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated });
	}
});

