import Bookshelf from '../../db';

/* eslint-disable object-shorthand */

/**
 * @typedef Event
 * @property {string} id.required - ID
 * @property {string} type.required - Type
 * @property {string} status.required - Status
 * @property {string} ship_id - ID of the ship where the event is taking place
 * @property {string} occurs_at - ISO 8601 String Date-time when event will occur
 * @property {object} metadata - JSON representation of any data related to the event
 * @property {boolean} is_active - Boolean stating if the task is active
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const Event = Bookshelf.Model.extend({
	tableName: 'event',
	hasTimestamps: true,
});
