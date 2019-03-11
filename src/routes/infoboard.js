import { Router } from 'express';
import { Event } from '../models/event';
import { InfoEntry } from '../models/infoentry';
import { InfoPriority } from '../models/infoentry';
import { handleAsyncErrors } from '../helpers';
import { logger, loggerMiddleware } from '../logger';

const router = new Router();

let timeTo = function(time, prefix, expired) {
	let seconds = parseInt((time.getTime() - (new Date()).getTime()) / 1000);
	const hours = parseInt(seconds / 3600);
	const minutes = parseInt((seconds - hours * 3600) / 60);
	seconds = seconds % 60;
	let text = seconds + " seconds";
	if( minutes > 0 ) {
		text = minutes + " minutes, " + text;
	}
	if( hours > 0 ) {
		text = hours + " hours, " + text;
	}
	text = prefix + text;
	if( seconds <  0 || minutes < 0 || hours < 0 ) {
		text = expired;
	}
	return text;
}

/**
 * Get a single infoboard entry to display
 * @route GET /infoboard
 * @group Infoboard - Infoboard related operations
 * @returns {<InfoEntry>} 200 - An infoboard entry
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const jumpEvent = await Event.forge().where({ship_id: 'odysseus', is_active: true, type: 'JUMP'}).fetch();
	const prepEvent = await Event.forge().where({ship_id: 'odysseus', is_active: true, type: 'JUMP_PREP'}).fetch();
	const now = new Date();
	const selector = parseInt((now.getMinutes() * 60 + now.getSeconds()) / 5);
	const priority = await InfoPriority.forge().fetch();
	const entries = await InfoEntry.forge().where({priority: priority.attributes.priority}).fetchAll();
	const count = entries.length;
	const realSelector = selector % count;
	let entry = entries.models[realSelector];
	if( prepEvent ) {
		let time = timeTo(prepEvent.attributes.occurs_at, "Ready to jump in ", "Ready to jump.");
		entry.attributes.jump_text = time;
	}
	if( jumpEvent ) {
		let time = timeTo(jumpEvent.attributes.occurs_at, "Jump in ", "Jumping now!");
		entry.attributes.jump_text = time;
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
