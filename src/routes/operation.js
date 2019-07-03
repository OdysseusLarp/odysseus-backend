import { Router } from 'express';
import { OperationResult } from '../models/tag';
import { Person, BloodTestResult, Entry } from '../models/person';
import { handleAsyncErrors } from '../helpers';
import { logger } from '../logger';
import { NotFound } from 'http-errors';
import { get } from 'lodash';
const router = new Router();

// Should be in env but not gonna bother at this point
const EVA_ID = '20263';

async function getBloodTestResult(person_id) {
	const result = await new BloodTestResult().where({ person_id }).fetch();
	if (!result) return 'Blood could not be analysed';
	return `**Blood test results:**

	Blood type: ${result.get('blood_type')}

Hemoglobin: ${result.get('hemoglobin')} g/l

Leukocytes: ${result.get('leukocytes')} E9/l

Kalium: ${result.get('kalium')} mmol/l

Natrium: ${result.get('natrium')} mmol/l

hCG: ${result.get('hcg')} IU/l

ACN enzyme: ${result.get('acn_enzyme')} mmol/l

Substance abuse: ${result.get('sub_abuse')}

Details: ${result.get('details') || 'None'}`;
}

/**
 * Get a list of all operation results
 * @route GET /operation
 * @group Operation - HANSCA Operation related operations
 * @param {boolean} relations.query - True if all relations and not just IDs should be included, defaults to false
 * @param {boolean} include_complete.query - True if completed results should be included, defaults to false
 * @returns {Array.<OperationResult>} 200 - List of all OperationResult models
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const shouldContainRelations = get(req, 'query.relations') === 'true';
	const include_complete = get(req, 'query.include_complete') === 'true';
	const where = include_complete ? {} : { is_complete: false };
	res.json(await OperationResult.forge().where(where)[shouldContainRelations ? 'fetchAllWithRelated' : 'fetchAll']());
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

	// Add blood samples to medical file once analysed
	if (operationResult.get('additional_type') === 'BLOOD_SAMPLE' && operationResult.get('is_analysed') && !operationResult.get('is_complete')) {
		const person = await new Person().where({ bio_id: operationResult.get('bio_id') }).fetch();
		const bloodTestResult = await getBloodTestResult(person.get('id'));
		const entry = new Entry();
		await entry.save({ added_by: EVA_ID, entry: bloodTestResult, person_id: person.get('id'), type: 'MEDICAL' });
		logger.success(
			`Added blood test results to ${person.get('full_name')} (${person.get('id')}), marking the operation as complete`
		);
		await operationResult.save({ is_complete: true }, { method: 'update', patch: true });
	}

	// Add rotating skeleton pic to medical file after an XRAY_SCAN
	if (operationResult.get('additional_type') === 'XRAY_SCAN' && !operationResult.get('is_complete')) {
		const medicalEntryText = `**XRAY Scan:**

![](/images/skeleton.gif)`;
		const person = await new Person().where({ bio_id: operationResult.get('bio_id') }).fetch();
		await new Entry().save({ added_by: EVA_ID, entry: medicalEntryText, person_id: person.get('id'), type: 'MEDICAL' });
		logger.success(
			`Added XRAY scan results to ${person.get('full_name')} (${person.get('id')}), marking the operation as complete`
		);
		await operationResult.save({ is_complete: true }, { method: 'update', patch: true });
	}
	res.json(operationResult);
}));

export default router;
