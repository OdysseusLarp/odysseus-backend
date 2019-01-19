const persons = [
	{
		id: '593201', chip_id: '028293', first_name: 'Maud', last_name: 'Maltby',
		occupation: 'medic', home_planet: 'Kobol', dynasty: 'Xia',
		dynasty_rank: 1, birth_year: 2179, status: 'unknown'
	},
	{
		id: '593202', chip_id: '038294', first_name: 'Tremaine', last_name: 'Vlies',
		occupation: 'soldier', home_planet: 'Kobol', dynasty: 'Xia',
		dynasty_rank: 2, birth_year: 2179, status: 'on_duty'
	},
	{
		id: '593203', chip_id: '038295', first_name: 'Lizzie', last_name: 'Scarrisbrick',
		occupation: 'researcher', home_planet: 'Kobol', dynasty: 'Xia',
		dynasty_rank: 3, birth_year: 2179, status: 'unknown'
	},
	{
		id: '593204', chip_id: '038296', first_name: 'Bent', last_name: 'Gingel',
		occupation: 'soldier', home_planet: 'Kobol', dynasty: 'Xia',
		dynasty_rank: 4, birth_year: 2179, status: 'on_duty'
	},
	{
		id: '593205', chip_id: '038297', first_name: 'Cleon', last_name: 'Hubble',
		occupation: 'engineer', home_planet: 'Kobol', dynasty: 'Xia',
		dynasty_rank: 5, birth_year: 2179, status: 'on_duty'
	}
];

const personFamily = [
	{ person1_id: '593201', person2_id: '593202', relation: 'cousin' },
	{ person1_id: '593202', person2_id: '593201', relation: 'cousin' },
	{ person1_id: '593203', person2_id: '593204', relation: 'sister' },
	{ person1_id: '593204', person2_id: '593203', relation: 'brother' },
];

const medicalData = persons.map(person => (
	{
		person_id: person.id,
		blood_type: 'A',
		surgeries: 'Heart surgery lorem ipsum',
		medication: 'Burana a day',
		immunization: 'Lorem ipsum',
		allergies: 'Lorem ipsum',
		medical_history: 'Lorem ipsum'
	}
));

const medicalEntries = [
	{ id: 1, time: '1.1.1970', details: 'Kidney removed' },
	{ id: 2, time: '1.1.1970', details: 'Common cold' },
	{ id: 3, time: '1.1.1970', details: 'Common cold' },
	{ id: 4, time: '1.1.1970', details: 'Radiation poisoning' },
	{ id: 5, time: '1.1.1970', details: 'Has a pulse' }
];

const personMedicalEntries = persons.map((person, i) => ({
	person_id: person.id,
	entry_id: i + 1
}));

const militaryData = [
	{
		person_id: '593201', rank: 'Private', unit: 'Platoon A',
		remarks: 'Lorem ipsum', service_history: 'Lorem ipsum'
	},
	{
		person_id: '593202', rank: 'Sergeant', unit: 'Platoon A',
		remarks: null, service_history: 'Lorem ipsum'
	},
	{
		person_id: '593203', rank: 'First sergeant', unit: 'Platoon B',
		remarks: 'Lorem ipsum', service_history: 'Lorem ipsum'
	},
	{
		person_id: '593204', rank: 'Sergeant', unit: 'Platoon B',
		remarks: null, service_history: 'Lorem ipsum'
	}
];

exports.seed = async knex => {
	await knex('person_military_data').del();
	await knex('person_family').del();
	await knex('person_medical_data').del();
	await knex('person_medical_entry').del();
	await knex('medical_entry').del();
	await knex('person').del();
	await knex('person').insert(persons);
	await knex('medical_entry').insert(medicalEntries);
	await knex('person_family').insert(personFamily);
	await knex('person_medical_data').insert(medicalData);
	await knex('person_medical_entry').insert(personMedicalEntries);
	await knex('person_military_data').insert(militaryData);
	// fix the medical_entry primary key sequence
	await knex.raw(`SELECT setval('medical_entry_id_seq', 6)`);
};
