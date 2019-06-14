import { Router } from 'express';
import { OperationResult } from '../models/tag';
import { handleAsyncErrors } from '../helpers';
import { NotFound } from 'http-errors';
import { get } from 'lodash';
const router = new Router();

/**
 * Get a list of all operation results
 * @route GET /operation
 * @group Operation - HANSCA Operation related operations
 * @param {boolean} relations.query - True if all relations and not just IDs should be included in response
 * @returns {Array.<OperationResult>} 200 - List of all OperationResult models
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const shouldContainRelations = get(req, 'query.relations') === 'true';
	res.json(await OperationResult.forge()[shouldContainRelations ? 'fetchWithRelated' : 'fetch']());
}));

/**
 * Get a single operation by operation id
 * @route GET /operation/{id}
 * @group Operation - HANSCA Operation related operations
 * @param {string} id.path.required - OperationResult id
 * @param {boolean} relations.query - True if all relations and not just IDs should be included in response
 * @returns {Error} 404 - OperationResult not found
 * @returns {OperationResult.model} 200 - OperationResult model
 */
router.get('/:id', handleAsyncErrors(async (req, res) => {
	const shouldContainRelations = get(req, 'query.relations') === 'true';
	const operationResult = await OperationResult
		.forge({ id: req.params.id })[shouldContainRelations ? 'fetchWithRelated' : 'fetch']();
	if (!operationResult) throw new NotFound('OperationResult not found');
	res.json(operationResult);
}));

/**
 * Insert a new operation result
 * @route POST /operation
 * @consumes application/json
 * @group Operation - HANSCA Operation related operations
 * @param {OperationResult.model} operationresult.body.required - OperationResult model
 * @returns {OperationResult.model} 200 - Inserted OperationResult model
 */
router.post('/', handleAsyncErrors(async (req, res) => {
	const operationResult = await OperationResult.forge().save(req.body, { method: 'insert' });
	res.json(operationResult);
}));

/**
 * Update an operation result by id
 * @route PUT /operation/{id}
 * @consumes application/json
 * @group Operation - HANSCA Operation related operations
 * @param {string} id.path.required - OperationResult id
 * @param {OperationResult.model} operationresult.body.required - OperationResult model new values
 * @returns {OperationResult.model} 200 - Updated OperationResult model
 */
router.put('/:id', handleAsyncErrors(async (req, res) => {
	const operationResult = await OperationResult.forge({ id: req.params.id }).fetch();
	if (!operationResult) throw new NotFound('OperationResult not found');
	await operationResult.save(req.body, { method: 'update', patch: true });
	res.json(operationResult);
}));

export default router;
