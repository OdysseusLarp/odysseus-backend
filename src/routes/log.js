import { Router } from 'express';
import { LogEntry, AuditLogEntry } from '../models/log';
import { handleAsyncErrors } from './helpers';
import { get } from 'lodash';
import httpErrors from 'http-errors';
const router = new Router();

const DEFAULT_LOG_PAGE = 1;
const DEFAULT_LOG_ENTRIES_PER_PAGE = 150;

/**
 * Get a list of all log entries
 * @route GET /log
 * @group Log - Ship log related operations
 * @param {number} page.query - Page number - e.g: 1
 * @param {number} entries.query - Number of entries per page - e.g: 150
 * @returns {Array.<LogEntry>} 200 - Page of log entries
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const page = parseInt(get(req.query, 'page', DEFAULT_LOG_PAGE), 10);
	const pageSize = parseInt(get(req.query, 'entries', DEFAULT_LOG_ENTRIES_PER_PAGE), 10);
	res.json(await LogEntry.forge().orderBy('-created_at').fetchPage({ page, pageSize }));
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
	if (!logEntry) logEntry = await LogEntry.forge().save(req.body, { method: 'insert' });
	else await logEntry.save(req.body, { method: 'update', patch: true });
	res.json(logEntry);
}));

/**
 * Get a list of audit log entries
 * @route GET /log/audit
 * @group Log - Ship log related operations
 * @param {number} page.query - Page number - e.g: 1
 * @param {number} entries.query - Number of entries per page - e.g: 150
 * @returns {Array.<AuditLogEntry>} 200 - Page of log entries
 */
router.get('/audit', handleAsyncErrors(async (req, res) => {
	const page = parseInt(get(req.query, 'page', DEFAULT_LOG_PAGE), 10);
	const pageSize = parseInt(get(req.query, 'entries', DEFAULT_LOG_ENTRIES_PER_PAGE), 10);
	res.json(await AuditLogEntry.forge().orderBy('-created_at').fetchPageWithRelated({ page, pageSize }));
}));

/**
 * Insert audit log entry
 * @route POST /log/audit
 * @consumes application/json
 * @group Log - Ship log related operations
 * @param {AuditLogEntry.model} log_entry.body.required - AuditLogEntry model to be inserted
 * @returns {AuditLogEntry.model} 200 - Inserted AuditLogEntry values
 */
router.post('/audit', handleAsyncErrors(async (req, res) => {
	res.json(await AuditLogEntry.forge().save(req.body));
}));

/**
 * Delete log entry by id
 * @route DELETE /log/{id}
 * @group Log - Ship log related operations
 * @param {string} id.path.required - Log entry id
 * @returns {object} 204 - Empty response on success
 */
router.delete('/:id', handleAsyncErrors(async (req, res) => {
	const id = parseInt(req.params.id, 10);
	const logEntry = await LogEntry.forge({ id }).fetch();
	if (!logEntry) throw new httpErrors.NotFound('Log entry not found');
	await logEntry.destroy();
	res.sendStatus(204);
}));

export default router;
