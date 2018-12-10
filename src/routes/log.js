import { Router } from 'express';
import { LogEntry } from '../models/log';
import { handleAsyncErrors } from '../helpers';
const router = new Router();

/**
 * Get a list of all log entries
 * @route GET /log
 * @group Log - Ship log related operations
 * @returns {Array.<LogEntry>} 200 - List of all log entries
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	// TODO: add pagination
	res.json(await LogEntry.forge().fetchAll());
}));

/**
 * Update or insert log entry
 * @route PUT /log
 * @consumes application/json
 * @group Log - Ship log related operations
 * @param {LogEntry.model} log_entry.body.required - LogEntry model to be updated or inserted
 * @returns {LogEntry.model} 200 - Updated or inserted LogEntry values
 */
router.put('/', handleAsyncErrors(async (req, res) => {
	const { id } = req.body;
	// TODO: Validate input
	let logEntry;
	if (id) logEntry = await LogEntry.forge({ id }).fetch();
	if (!logEntry) {
		logEntry = await LogEntry.forge().save(req.body, { method: 'insert' });
		req.io.emit('logEntryAdded', logEntry);
	} else {
		await logEntry.save(req.body, { method: 'update' });
		req.io.emit('logEntryUpdated', logEntry);
	}
	res.json(logEntry);
}));

export default router;
