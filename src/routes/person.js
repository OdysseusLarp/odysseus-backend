import { Router } from 'express';
import { Person, Entry, Group, getFilterableValues, setPersonsVisible } from '@/models/person';
import { addShipLogEntry, AuditLogEntry } from '@/models/log';
import { handleAsyncErrors } from './helpers';
import { get, pick, mapKeys, snakeCase } from 'lodash';
import { NotFound, BadRequest } from 'http-errors';
import { logger } from '@/logger';
import { getHackingDetectionTime, getRandomHackingIntrustionDetectionMessage } from '@/utils/hacking';
import * as dmx from '@/dmx';
const router = new Router();

const DEFAULT_PERSON_PAGE = 1;
const DEFAULT_PERSON_ENTRIES_PER_PAGE = 1000;

/**
 * Get a page of persons
 * @route GET /person
 * @group Person - Operations for person related data
 * @param {integer} page.query - Page number
 * @param {integer} entries.query - Amount of items returned per page
 * @param {boolean} show_hidden.query - Should hidden persons be shown
 * @param {boolean} is_character.query - If true, return characters only
 * @param {string} name.query - Person name filter
 * @param {string} dynasty.query - Person dynasty filter
 * @param {string} home_planet.query - Person home planet filter
 * @param {string} ship_id.query - Person ship filter
 * @param {string} status.query - Person status filter
 * @param {string} title.query - Person title filter
 * @returns {PersonCollection} 200 - Page of persons
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const page = parseInt(get(req.query, 'page', DEFAULT_PERSON_PAGE), 10);
	const pageSize = parseInt(get(req.query, 'entries', DEFAULT_PERSON_ENTRIES_PER_PAGE), 10);
	const showHidden = get(req.query, 'show_hidden') === 'true';
	const nameFilter = get(req.query, 'name', '').toLowerCase();
	const filters = mapKeys(
		pick(req.query, ['dynasty', 'home_planet', 'ship_id', 'status', 'title', 'is_character']),
		(_value, key) => snakeCase(key),
	);
	if (nameFilter) filters.name = nameFilter;
	const persons = await Person.forge().fetchListPage({
		page,
		pageSize,
		showHidden,
		filters
	});
	const pagination = pick(get(persons, 'pagination', {}), ['rowCount', 'pageCount', 'page', 'pageSize']);
	res.json({
		persons,
		...pagination
	});
}));

/**
 * Get values that persons can be filtered by
 * @route GET /person/filters
 * @group Person - Operations for person related data
 * @returns {FilterValuesResponse.model} 200 - Collection of available filters
 */
router.get('/filters', handleAsyncErrors(async (req, res) => {
	res.json(await getFilterableValues());
}));

/**
 * Get a list of all groups
 * @route GET /person/groups
 * @consumes application/json
 * @group Person - Operations for person related data
 * @returns {Array.<Group>} 200 - List of all groups
 */
router.get('/groups', handleAsyncErrors(async (req, res) => {
	res.json(await Group.forge().fetchAll());
}));

/**
 * Get a specific person by id. Also contains their family, medical and military data.
 * @route GET /person/{id}
 * @group Person - Operations for person related data
 * @param {integer} id.path.required - ID of the person
 * @param {boolean} login.query - True if this query is performed to log in to Social Hub
 * @param {string} hacker_id.query - ID of the hacker who performed the login
 * @returns {Person.model} 200 - Specific person
 */
router.get('/:id', handleAsyncErrors(async (req, res) => {
	const isLogin = req.query.login === 'true';
	const hackerId = req.query.hacker_id;
	const personId = req.params.id;
	const person = await Person.forge({ id: personId }).fetchWithRelated();

	const isHackerLogin = isLogin && person && hackerId;
	if (isHackerLogin) {
		const hacker = await Person.forge({ id: hackerId }).fetchWithRelated();
		// Get the hacking detection time based on the hacker's skill level
		const detectionTimeMs = getHackingDetectionTime(hacker);
		await AuditLogEntry.forge().save({
			person_id: personId,
			hacker_id: hackerId,
			type: 'HACKER_LOGIN'
		});

		const intrusionDetectedMessage = getRandomHackingIntrustionDetectionMessage();

		// TODO: If the hacker logs out, we should be able to match to this timeout, cancel it,
		// and run the function immediately
		setTimeout(() => {
			addShipLogEntry('WARNING', intrusionDetectedMessage);
			dmx.fireEvent(dmx.CHANNELS.DataHubHackingDetected);
		}, detectionTimeMs);

		return res.json({ ...person.toJSON(), hacker: { detectionTimeMs, intrusionDetectedMessage } });
	}

	res.json(person);
}));

/**
 * Get a specific person by card id. Also contains their family, medical and military data.
 * @route GET /person/card/{id}
 * @group Person - Operations for person related data
 * @param {string} id.path.required - Card ID of the person
 * @param {boolean} login.query - True if this query is performed to log in to Social Hub
 * @returns {Person.model} 200 - Specific person
 */
router.get('/card/:id', handleAsyncErrors(async (req, res) => {
	const isLogin = req.query.login === 'true';
	const person = await Person.forge({ card_id: get(req.params, 'id', '').toUpperCase() }).fetchWithRelated();
	// Save login to audit log if the login succeeded
	if (isLogin && person) {
		AuditLogEntry.forge().save({
			person_id: person.get('id'),
			type: 'LOGIN'
		});
	} else if (isLogin && !person) {
		logger.warn('Social Hub login attempted with invalid ID', req.params.id);
	}
	res.json(person);
}));

/**
 * Get a specific person by bio id. Also contains their family, medical and military data.
 * @route GET /person/bio/{id}
 * @group Person - Operations for person related data
 * @param {string} id.path.required - Bio ID of the person
 * @returns {Person.model} 200 - Specific person
 */
router.get('/bio/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Person.forge({ bio_id: req.params.id }).fetchWithRelated());
}));

/**
 * Search for a person using their name
 * @route GET /person/search/{name}
 * @group Person - Operations for person related data
 * @param {string} name.path.required - Name or partial name of the person
 * @returns {Person.model} 200 - List of persons matching search criteria
 */
router.get('/search/:name', handleAsyncErrors(async (req, res) => {
	const name = get(req.params, 'name', '').toLowerCase();
	const persons = await new Person().search(name);
	res.json(persons);
}));

/**
 * Set is_visible=true for all persons except for those in PERMANENTLY_HIDDEN_PERSONS
 * @route PUT /person/set-visible
 * @consumes application/json
 * @group Person - Operations for person related data
 * @returns {object} 204 - OK Empty Response
 */
router.put('/set-visible', handleAsyncErrors(async (req, res) => {
	await setPersonsVisible();
	res.sendStatus(204);
}));

/**
 * Update person by id
 * @route PUT /person/{id}
 * @consumes application/json
 * @group Person - Operations for person related data
 * @param {string} id.path.required - ID of the person
 * @param {Person.model} person.body.required - Person object fields to be updated
 * @returns {Person.model} 200 - Updated Person values
 */
router.put('/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	// TODO: Validate input
	const person = await Person.forge({ id }).fetch();
	if (!person) throw new Error('Person not found');
	await person.save(req.body, { method: 'update', patch: true });
	res.json(person);
}));

/**
 * Update or insert a family relation by person id. WIP - Not working properly yet.
 * @route PUT /person/{id}/family
 * @consumes application/json
 * @group Person - Operations for person related data
 * @param {string} id.path.required - ID of the person
 * @param {string} familyMemberId.body.required - ID of the person being added/updated as a relative
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
 * Insert new entry for a person by person id
 * @route POST /person/{id}/entry
 * @consumes application/json
 * @group Person - Operations for person related data
 * @param {string} id.path.required - ID of the person
 * @param {Entry.model} entry.body.required - Entry object fields to be updated
 * @returns {Entry.model} 200 - Inserted Entry value
 */
router.post('/:id/entry', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	const entry = await Entry.forge().save({ person_id: id, ...req.body }, { method: 'insert' });
	res.json(entry);
}));

/**
 * Kill this person (set status to deceased and add a personal entry that says deceased)
 * @route PUT /person/{id}/kill
 * @consumes application/json
 * @group Person - Operations for person related data
 * @param {string} id.path.required - ID of the person
 * @returns {Object} 204 - OK Empty Response
 */
router.put('/:id/kill', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	const person = await Person.forge({ id }).fetch();
	if (!person) throw new NotFound('Person not found');
	if (person.get('status') === 'Deceased') throw new BadRequest('Person is already deceased');
	await person.killPerson();
	res.sendStatus(204);
}));

/**
 * Attach person to a group
 * @route PUT /person/{id}/group/{groupId}
 * @consumes application/json
 * @group Person - Operations for person related data
 * @param {string} id.path.required - ID of the person
 * @param {string} groupId.path.required - ID of the group
 * @returns {Error} 404 - Group or person not found
 * @returns {object} 204 - Empty response
 */
router.put('/:id/group/:groupId', handleAsyncErrors(async (req, res) => {
	const { id, groupId } = req.params;
	const [person, group] = await Promise.all([
		Person.forge({ id }).fetch(),
		Group.forge({ id: groupId }).fetch()
	]);
	if (!person) throw new NotFound('Person not found');
	if (!group) throw new NotFound('Group not found');
	await person.addToGroup(group.get('id'));
	res.sendStatus(204);
}));

/**
 * Detach person from a group
 * @route DELETE /person/{id}/group/{groupId}
 * @consumes application/json
 * @group Person - Operations for person related data
 * @param {string} id.path.required - ID of the person
 * @param {string} groupId.path.required - ID of the group
 * @returns {Error} 404 - Group or person not found
 * @returns {object} 204 - Empty response
 */
router.delete('/:id/group/:groupId', handleAsyncErrors(async (req, res) => {
	const { id, groupId } = req.params;
	const [person, group] = await Promise.all([
		Person.forge({ id }).fetch(),
		Group.forge({ id: groupId }).fetch()
	]);
	if (!person) throw new NotFound('Person not found');
	if (!group) throw new NotFound('Group not found');
	await person.deleteFromGroup(group.get('id'));
	res.sendStatus(204);
}));

export default router;
