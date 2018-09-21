import Bookshelf from '../../db';
import { Task, Box } from './';
import { validate } from '../rules';

function task() {
	return this.belongsToOne(Task);
}

function box() {
	return this.hasOne(Box, 'id');
}

function is_completed() {
	return validate(this);
}

export const TaskRequirement = Bookshelf.Model.extend({
	tableName: 'task_requirement',
	hasTimestamps: true,
	task,
	box,
	virtuals: {
		is_completed
	}
});
