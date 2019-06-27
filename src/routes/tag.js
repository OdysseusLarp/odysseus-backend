import { Router } from 'express';
import { Tag } from '../models/tag';
import { handleAsyncErrors } from '../helpers';
import { NotFound } from 'http-errors';
import { get } from 'lodash';
import Bookshelf from '../../db';
const router = new Router();

/**
 * Get a list of all tags
 * @route GET /tag
 * @group Tag - Tag related operations
 * @param {boolean} operations.query - True if response should contain operations related to this tag
 * @returns {Array.<Tag>} 200 - List of all tags
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const shouldContainTags = get(req, 'query.operations') === 'true';
	res.json(await Tag.forge()[shouldContainTags ? 'fetchAllWithRelated' : 'fetchAll']());
}));

/**
 * Get a single tag by id
 * @route GET /tag/{id}
 * @group Tag - Tag related operations
 * @param {string} id.path.required - Tag id
 * @param {boolean} operations.query - True if response should contain operations related to this tag
 * @returns {Error} 404 - Tag not found
 * @returns {Tag.model} 200 - Tag model
 */
router.get('/:id', handleAsyncErrors(async (req, res) => {
	const shouldContainTags = get(req, 'query.operations') === 'true';
	const tag = await Tag.forge({ id: req.params.id })[shouldContainTags ? 'fetchWithRelated' : 'fetch']();
	if (!tag) throw new NotFound('Tag not found');
	res.json(tag);
}));

/**
 * Update or insert a tag
 * @route PUT /tag
 * @consumes application/json
 * @group Tag - Tag related operations
 * @param {Tag.model} tag.body.required - Tag model to be inserted/updated
 * @returns {Tag.model} 200 - Updated Tag values
 */
router.put('/', handleAsyncErrors(async (req, res) => {
	const { id } = req.body;
	let tag;
	if (id) tag = await Tag.forge({ id }).fetch();
	if (!tag) {
		tag = await Bookshelf.transaction(transacting =>
			Tag.forge().save(req.body, { method: 'insert', transacting }));
	} else {
		await Bookshelf.transaction(transacting =>
			Tag.forge().save(req.body, { method: 'update', transacting, patch: true }));
	}
	res.json(tag);
}));

/**
 * Delete tag by id
 * @route DELETE /tag/{id}
 * @group Tag - Tag related operations
 * @param {string} id.path.required - Tag id
 * @returns {object} 204 - OK Empty Response
 */
router.delete('/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	const tag = await Tag.forge({ id }).fetch();
	if (!tag) throw new NotFound('Tag not found');
	await tag.destroy();
	res.sendStatus(204);
}));

export default router;
