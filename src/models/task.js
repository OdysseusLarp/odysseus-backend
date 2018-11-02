import Bookshelf from '../../db';

/**
 * @typedef Task
 * @property {integer} id.required
 * @property {string} name.required - Task name
 * @property {string} description.required - Task description
 * @property {string} type.required - Task type, for example "SCHEDULED", "GM"
 * @property {boolean} is_active.required - Boolean stating if task is currently active
 * @property {Array.<string>} systems.required - List of systems that use this task
 * @property {date} created_at
 * @property {date} updated_at
 */
export const Task = Bookshelf.Model.extend({
	tableName: 'task',
	hasTimestamps: true
});
