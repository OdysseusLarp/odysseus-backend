import { Router } from 'express';
import { Event } from '../models/event';
import { InfoEntry } from '../models/infoentry';
import { InfoPriority } from '../models/infoentry';
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
    const event = await Event.forge().where({ship_id: 'odysseus', is_active: true, type: 'JUMP'}).fetch();
	const now = new Date();
	const selector = parseInt((now.getMinutes() * 60 + now.getSeconds()) / 5);
	const priority = await InfoPriority.forge().fetch();
    const entries = await InfoEntry.forge().where({priority: priority.attributes.priority}).fetchAll();
	const count = entries.length;
    const realSelector = selector % count;
    let entry = entries.models[realSelector];
    if( event ) {
	let seconds = parseInt((event.attributes.occurs_at.getTime() - now.getTime()) / 1000);
	const hours = parseInt(seconds / 3600);
	const minutes = parseInt((seconds - hours * 3600) / 60);
	seconds = seconds % 60;
	let time = seconds + " seconds";
	if( minutes > 0 ) {
	    time = minutes + " minutes, " + time;
	}
	if( hours > 0 ) {
	    time = hours + " hours, " + time;
	}
	if( seconds <  0 || minutes < 0 || hours < 0 ) {
	    time = "JUMPING NOW";
	}
	entry.attributes.time_to_jump = time;
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
