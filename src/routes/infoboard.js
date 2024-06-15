import { Router } from 'express';
import { InfoEntry } from '../models/infoentry';
import { InfoPriority } from '../models/infoentry';
import { LogEntry } from '../models/log';
import { Post } from '../models/post';
import { handleAsyncErrors } from './helpers';
import Bookshelf from '../../db';
import httpErrors from 'http-errors';

const router = new Router();

/**
 * Update current priority
 * @route PUT /infoboard/priority
 * @consumes application/json
 * @group Infoboard - Infoboard related operations
 * @param {number} priority.body.required - New priority to set
 * @returns {object} 200 - Empty response on success
 */
router.put('/priority', handleAsyncErrors(async (req, res) => {
	await Bookshelf.knex('infoboard_priority').where('priority', '>', 0).update({ priority: req.body.priority });
	res.sendStatus(200);
}));

/**
 * Get a single infoboard entry to display
 * @route GET /infoboard/display
 * @group Infoboard - Infoboard related operations
 * @returns {<InfoEntry>} 200 - An infoboard entry
 */
router.get('/display', handleAsyncErrors(async (req, res) => {
	const now = new Date();
	const minuteAgo = new Date();
	minuteAgo.setMinutes(minuteAgo.getMinutes()-1);
	const selector = parseInt((now.getMinutes() * 6 + now.getSeconds() / 10), 10);
	const priority = await InfoPriority.forge().fetch();
	const entries = await InfoEntry.forge().where({ priority: priority.attributes.priority }).fetchAll();
	let news = await Post.forge()
		.where({ type: 'NEWS', status: 'APPROVED' })
		.orderBy('created_at', 'DESC')
		.fetchPage({ pageSize: 5 });

	// Filter out the news with show_on_infoboard === false
	if (news) news = news.filter(n => {
		const showOnInfoboard = n.get('show_on_infoboard');
		return showOnInfoboard;
	});

	const log = await LogEntry.forge().orderBy('id', 'DESC').fetch();
	const count = entries.length + (priority.attributes.priority < 5 ? news.length : 0);
	const realSelector = selector % count;
	let entry = null;
	if ( log && log.attributes.metadata && log.attributes.metadata.showPopup && log.attributes.created_at > minuteAgo ) {
		entry = log;
		entry.attributes.body = log.attributes.message;
		entry.attributes.title = 'Ship Log Entry';
	} else {
		if ( realSelector > entries.length - 1 ) {
			entry = news[realSelector - entries.length];
		} else {
			entry = entries.models[realSelector];
		}
	}
	res.json(entry);
}));

/**
 * Get a list of all enabled infoboard entries
 * @route GET /infoboard/enabled
 * @group Infoboard - Infoboard related operations
 * @returns {Array.<InfoEntry>} 200 - List of all enabled entries
 */
router.get('/enabled', handleAsyncErrors(async (req, res) => {
	res.json(await InfoEntry.forge({ enabled: true }).fetchAll());
}));

/**
 * Get a list of all infoboard entries and the current priority
 * @route GET /infoboard/
 * @group Infoboard - Infoboard related operations
 * @returns {Array.<InfoEntry>} 200 - List of all entries
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const priority = await InfoPriority.forge().fetch();
	res.json({ priority, infoboards: await InfoEntry.forge().fetchAll() });
}));

/**
 * Add a new infoboard entry
 * @route PUT /infoboard
 * @consumes application/json
 * @group Infoboard - Infoboard related operations
 * @param {InfoEntry.model} info_entry.body.required - InfoEntry model to be inserted
 * @returns {InfoEntry.model} 200 - Inserted InfoEntry values
 */
router.put('/', handleAsyncErrors(async (req, res) => {
	const infoEntry = await InfoEntry.forge().save(req.body, { method: 'insert' });
	res.json(infoEntry);
}));

/**
 * Update infoboard entry by id
 * @route PUT /infoboard/{id}
 * @consumes application/json
 * @group Infoboard - Infoboard related operations
 * @param {string} id.path.required - ID of the person
 * @param {InfoEntry.model} info_entry.body.required - InfoEntry model to be updated
 * @returns {InfoEntry.model} 200 - Updated InfoEntry values
 */
router.put('/:id', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	// TODO: Validate input
	const info = await InfoEntry.forge({ id }).fetch();
	if (!info) throw new httpErrors.NotFound('Infoboard entry not found');
	await info.save(req.body, { method: 'update', patch: true });
	res.json(info);
}));

/**
 * Delete infoboard entry by id
 * @route DELETE /infoboard/{id}
 * @group Infoboard - Infoboard related operations
 * @param {string} id.path.required - Infoboard entry id
 * @returns {object} 204 - Empty response on success
 */
router.delete('/:id', handleAsyncErrors(async (req, res) => {
	const id = parseInt(req.params.id, 10);
	const infoEntry = await InfoEntry.forge({ id }).fetch();
	if (!infoEntry) throw new httpErrors.NotFound('Infoboard entry not found');
	await infoEntry.destroy();
	req.io.emit('infoEntryDeleted', { id });
	res.sendStatus(204);
}));

export default router;
