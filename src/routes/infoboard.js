import { Router } from 'express';
import { InfoEntry } from '../models/infoentry';
import { handleAsyncErrors } from '../helpers';
import { logger, loggerMiddleware } from '../logger';

const router = new Router();

/**
 * Get a single infoboard entry to display
 * @route GET /infoboard
 * @group Infoboard - Infoboard related operations
 * @returns {<InfoEntry>} 200 - An infoboard entry
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const now = new Date();
	const selector = parseInt((now.getMinutes() * 60 + now.getSeconds()) / 5);
	const entries = await InfoEntry.forge().where({enabled: true}).orderBy('priority', 'DESC').fetchAll();
	let entry = null;
	let sum = 0;
	for( let e in entries.models ) {
		const attributes = entries.models[e].attributes;
		sum += parseInt(attributes.priority);
	}
	const realSelector = selector % sum;
	let currentSum = 0;
	for( let e in entries.models ) {
		const attributes = entries.models[e].attributes;
		currentSum += parseInt(attributes.priority);
		if( realSelector < currentSum ) {
			entry = entries.models[e];
			break;
		}
	}
    
    //const entry = entries.models[selector % 2];
	logger.debug('Loaded ' + entry + ' at ' + selector + ' from ' + entries.length + ' as ' + sum);
	res.json(entry);
}));

/**
 * Get a list of all enabled infoboard entries
 * @route GET /infoboard/enabled
 * @group Infoboard - Infoboard related operations
 * @returns {Array.<InfoEntry>} 200 - List of all enabled entries
 */
router.get('/enabled', handleAsyncErrors(async (req, res) => {
	res.json(await InfoEntry.forge({ enabled: true }).fetch());
}));

/**
 * Add a new infoboard entry
 * @route PUT /infoboard
 * @consumes application/json
 * @group Infoboard - Infoboard related operations
 * @param {InfoEntry.model} info_entry.body.required - InfoEntry model to be inserted
 * @returns {InfoEntry.model} 200 - Inserted InfoEntry values
 */
router.put('/infoboard', handleAsyncErrors(async (req, res) => {
	const infoEntry = await InfoEntry.forge().save(req.body, { method: 'insert' });
	res.json(infoEntry);
}));

export default router;
