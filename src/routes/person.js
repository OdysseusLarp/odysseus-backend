import { Router } from 'express';
import { Person, MedicalData, MedicalEntry, MilitaryData } from '../models/person';
import { handleAsyncErrors } from '../helpers';
const router = new Router();

/**
 * Get a list of all persons. Also contains their family, medical and military data.
 * @route GET /person
 * @group Persons - Operations for person related data
 * @returns {Array.<Person>} 200 - List of all persons
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	res.json(await Person.forge().fetchAllWithRelated());
}));

/**
 * Get a specific person by id. Also contains their family, medical and military data.
 * @route GET /person/{id}
 * @group Persons - Operations for person related data
 * @param {integer} id.path.required - Citizen ID of the person
 * @returns {Person.model} 200 - Specific person
 */
router.get('/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Person.forge({ id: req.params.id }).fetchWithRelated());
}));

/**
 * Update person by id
 * @route PUT /person/{id}
 * @group Persons - Operations for person related data
 * @param {string} id.path.required - Citizen ID of the person
 * @param {Person.model} person.body.required - Person object fields to be updated
 * @returns {Person.model} 200 - Updated Person values
 */
router.put('/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	// TODO: Validate input
	const person = await Person.forge({ id }).fetch();
	if (!person) throw new Error('Person not found');
	await person.save(req.body, { method: 'update' });
	res.json(person);
}));

/**
 * Update or insert a family relation by person id. WIP - Not working properly yet.
 * @route PUT /person/{id}/family
 * @group Persons - Operations for person related data
 * @param {string} id.path.required - Citizen ID of the person
 * @param {string} id.body.required - Citizen ID of the person being added/updated as a relative
 * @param {string} relation.body.required - Description of the relation, e.g. brother, sister, father...
 * @returns {Person.model} 200 - Updated Person values containing all family members
 */
router.put('/:id/family', handleAsyncErrors(async (req, res) => {
	const { id, relation } = req.body;
	// TODO: Validate input
	const person1 = await Person.forge({ id: req.params.id }).fetch();
	const person2 = await Person.forge({ id }).fetch();
	if (!person1 || !person2) throw new Error('Person not found');
	await person1.family().updatePivot({ relation }, { query: { where: { person2_id: id } } });
	res.json(await person1.fetch({ withRelated: 'family' }));
}));

/**
 * Update medical data of a person by person id
 * @route PUT /person/{id}/medical/data
 * @group Persons - Operations for person related data
 * @param {string} id.path.required - Citizen ID of the person
 * @param {MedicalData.model} medical_data.body.required - MedicalData object fields to be updated
 * @returns {MedicalData.model} 200 - Updated MedicalData values
 */
router.put('/:id/medical/data', handleAsyncErrors(async (req, res) => {
	// TODO: Validate input
	const medicalData = await MedicalData.forge({ person_id: req.params.id }).fetch();
	if (!medicalData) throw new Error('Person medical data not found');
	await medicalData.save(req.body, { method: 'update' });
	res.json(medicalData);
}));

/**
 * Insert new medical entry for a person by person id
 * @route POST /person/{id}/medical/entry
 * @group Persons - Operations for person related data
 * @param {string} id.path.required - Citizen ID of the person
 * @param {MedicalEntry.model} medical_entry.body.required - MedicalEntry object fields to be updated
 * @returns {MedicalEntry.model} 200 - Inserted MedicalEntry value
 */
router.post('/:id/medical/entry', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	// TODO: Validate input
	const person = await Person.forge({ id }).fetch();
	if (!person) throw new Error('Person not found');
	const medicalEntry = await MedicalEntry.forge().save(req.body, { method: 'insert' });
	await person.medical_entries().attach(medicalEntry);
	res.json(medicalEntry);
}));

/**
 * Update or insert military data of a person by person id
 * @route PUT /person/{id}/military
 * @group Persons - Operations for person related data
 * @param {string} id.path.required - Citizen ID of the person
 * @param {MilitaryData.model} military_data.body.required - MilitaryData object fields to be updated
 * @returns {MilitaryData.model} 200 - Updated MilitaryData values
 */
router.put('/:id/military', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	// TODO: Validate input
	let militaryData = await MilitaryData.forge({ person_id: id }).fetch();
	if (militaryData) await militaryData.save(req.body);
	else militaryData = await MilitaryData.forge().save(
		{ person_id: id, ...req.body }, { method: 'insert' });
	res.json(militaryData);
}));

export default router;
