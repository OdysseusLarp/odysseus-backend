import { Router } from 'express';
import { Person } from '../models/person';
import { handleAsyncErrors } from '../helpers';
const router = new Router();

/**
 * Get a list of all persons
 * @route GET /person
 * @group Persons - Operations related to persons
 * @returns {Array.<Person>} 200 - List of all persons
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	res.json(await Person.forge().fetchAllWithRelated());
}));

/**
 * Get a specific person by id
 * @route GET /person/{id}
 * @group Persons - Operations related to persons
 * @param {integer} id.path.required - person id
 * @returns {Person} 200 - Specific person
 */
router.get('/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Person.forge({ id: req.params.id }).fetchWithRelated());
}));

export default router;
