import { get } from 'lodash';
import Bookshelf from '../../db';

/**
 * @typedef {object} Task
 * @property {integer} id.required
 * @property {string} name.required - Task name
 * @property {string} description.required - Task description
 * @property {string} type.required - Task type, for example "SCHEDULED", "GM"
 * @property {boolean} is_active.required - Boolean stating if task is currently active
 * @property {Array.<string>} systems.required - List of systems that use this task
 * @property {string} created_at - Date-time when object was created
 * @property {string} updated_at - Date-time when object was last updated
 */
export const Task = Bookshelf.Model.extend({
	tableName: 'task',
	hasTimestamps: true
});

export const isTaskActive = async id => get(await Task.forge({ id }).fetch(), 'is_active', false);
