import { Router, Request, Response } from 'express';
import { OperationResult } from '@/models/tag';
import { Person, BloodTestResult, Entry } from '@/models/person';
import { handleAsyncErrors } from './helpers';
import { getData } from './data';
import { logger } from '@/logger';
import { NotFound } from 'http-errors';
import { get } from 'lodash';
import Bookshelf from 'bookshelf';
import { getBloodTestResultText } from '@/utils/blood-test-results';
import { Artifact, ArtifactEntry } from '@/models/artifact';

const router = Router();

// Should be in env but not gonna bother at this point
const EVA_ID = '20263';

async function getBloodTestResult(person_id: string) {
	const result = await new BloodTestResult().where({ person_id }).fetch();
	if (!result) return 'Blood could not be analysed';
	return getBloodTestResultText(result);
}

async function processXrayOperation(operationResult: Bookshelf.Model<unknown>) {
	// Add rotating skeleton pic to medical file after a medical XRAY_SCAN
	const isXrayScan = operationResult.get('additional_type') === 'XRAY_SCAN';
	const isComplete = operationResult.get('is_complete');
	const isMedicalScan = operationResult.get('type') === 'MEDIC';
	if (isXrayScan && isMedicalScan && !isComplete) {
		let imageFile = 'skeleton.gif';
		const person = await new Person().where({ bio_id: operationResult.get('bio_id') }).fetch();

		// Special cases
		if (person.get('id') === '20110' && !!get(getData('misc', 'medical'), 'show_20110_tumor')) {
			imageFile = 'brainscan.gif';
			logger.info(`Swapping XRAY result image to brain tumor gif`);
		} else if (person.get('id') === '20070' && !!get(getData('misc', 'medical'), 'show_20070_alien')) {
			imageFile = 'kontaminaatio.gif';
			logger.info(`Swapping XRAY result image to alien contamination gif`);
		}

		const medicalEntryText = `**XRAY Scan:**

		![](/images/${imageFile})`;

		await new Entry().save({ added_by: EVA_ID, entry: medicalEntryText, person_id: person.get('id'), type: 'MEDICAL' });
		logger.success(
			`Added XRAY scan results to ${person.get('full_name')} (${person.get('id')}), marking the operation as complete`
		);
		await operationResult.save({ is_complete: true, is_analysed: true }, { method: 'update', patch: true });
	}
}

const addOperationResultToMedicalEntry = async (operationResult: Bookshelf.Model<unknown>) => {
	const isBloodSample = operationResult.get('additional_type') === 'BLOOD_SAMPLE';
	const isAnalysed = operationResult.get('is_analysed');
	const isComplete = operationResult.get('is_complete');
	if (isBloodSample && isAnalysed && !isComplete) {
		const person = await new Person().where({ bio_id: operationResult.get('bio_id') }).fetch();
		const bloodTestResult = await getBloodTestResult(person.get('id'));
		const entry = new Entry();
		await entry.save({ added_by: EVA_ID, entry: bloodTestResult, person_id: person.get('id'), type: 'MEDICAL' });
		logger.success(
			`Added blood test results to ${person.get('full_name')} (${person.get('id')}), marking the operation as complete`
		);
		await operationResult.save({ is_complete: true }, { method: 'update', patch: true });
	}
};

const SampleTypes = {
	BLOOD_SAMPLE: 'Blood sample',
	GENE_SAMPLE: 'Gene sample',
	MATERIAL_SAMPLE: 'Material sample',
	OTHER_SAMPLE: 'Other sample',
	MICROSCOPE_SAMPLE: 'Microscopic analysis',
	AGE: 'Radiocarbon dating',
	HISTORY_SAMPLE: 'Historical analysis',
	XRF_SAMPLE: 'X-Ray Fluorescence analysis',
} as const;

const addOperationResultsToArtifactEntry = async (operationResult: Bookshelf.Model<unknown>) => {
	const operationType = operationResult.get('additional_type');
	const catalogId = operationResult.get('catalog_id');
	console.log("GOT DAT ATALOG ID", catalogId, operationType);
	if (!catalogId) return;

	const artifact = await Artifact.forge().where({ catalog_id: catalogId }).fetchWithRelated();
	if (!artifact) return;

	let entryText: string | null;
	switch (operationType) {
		case 'MATERIAL_SAMPLE':
			entryText = artifact.get('test_material');
			break;
		case 'MICROSCOPE_SAMPLE':
			entryText = artifact.get('test_microscope');
			break;
		case 'AGE':
			entryText = artifact.get('test_age');
			break;
		case 'XRF_SAMPLE':
			entryText = artifact.get('test_xrf');
			break;
		case 'HISTORY_SAMPLE':
			entryText = artifact.get('test_history');
			break;
		default:
			entryText = null;
	}

	console.log("FOUND ENTRY TESXT", entryText, operationType, artifact.get('name'));
	// console log whole deserialized artifact
	console.log("ARTIFACT", artifact.toJSON());

	// TODO: Check from artifact.entries[].entry if the operation result is already added (contains entryText)
	// if it does, throw a specific error, and give a specific response to the user

	// Add an artifact entry with the result text
	if (entryText) {
		entryText = `542 **${SampleTypes[operationType] ?? operationType} results:** ${entryText}`;
		const entry = new ArtifactEntry();
		await entry.save({
			artifact_id: artifact.get('id'),
			entry: entryText,
			person_id: EVA_ID
		});
		await operationResult.save({ is_complete: true }, { method: 'update', patch: true });
		logger.success(`Added ${operationType} results to artifact ${artifact.get('name')} (${artifact.get('catalog_id')})`);
	}
};

/**
 * Get a list of all operation results
 * @route GET /operation
 * @group Operation - HANSCA Operation related operations
 * @param {boolean} relations.query - True if all relations and not just IDs should be included, defaults to false
 * @param {boolean} include_complete.query - True if completed results should be included, defaults to false
 * @returns {Array.<OperationResult>} 200 - List of all OperationResult models
 */
router.get('/', handleAsyncErrors(async (req: Request, res: Response) => {
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
router.get('/:id', handleAsyncErrors(async (req: Request, res: Response) => {
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
router.post('/', handleAsyncErrors(async (req: Request, res: Response) => {
	const operationResult = await OperationResult.forge().save({
		...req.body,
		is_analysed: true, // All operations are now analysed by default and results get posted automatically
	}, { method: 'insert' });

	// Example request
	const _req = {
		is_complete: false,
		is_analysed: false,
		author_id: '20011',
		type: 'SCIENCE',
		additional_type: 'MATERIAL_SAMPLE',
		sample_id: 'ligmus',
		catalog_id: 'EL-QV57-1',
	};

	const operationResultType = operationResult.get('type');
	console.info("RECEIVED REQUEST", req.body);
	console.log("OPERATION RESULT TYPE", operationResultType);

	if (operationResultType === 'MEDIC') {
		// Automatically post blood test results, in case this is a blood sample
		await addOperationResultToMedicalEntry(operationResult);
	}

	if (operationResultType === 'SCIENCE') {
		// Automatically post artifact test results if available
		await addOperationResultsToArtifactEntry(operationResult);
	}

	await processXrayOperation(operationResult);
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
router.put('/:id', handleAsyncErrors(async (req: Request, res: Response) => {
	const operationResult = await OperationResult.forge({ id: req.params.id }).fetch();
	if (!operationResult) throw new NotFound('OperationResult not found');
	await operationResult.save(req.body, { method: 'update', patch: true });
	await addOperationResultToMedicalEntry(operationResult);
	await processXrayOperation(operationResult);
	res.json(operationResult);
}));

export default router;
