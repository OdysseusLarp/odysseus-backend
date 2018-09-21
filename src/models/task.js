import Bookshelf from '../../db';
import { TaskRequirement } from './';

function requirements() {
	return this.hasMany(TaskRequirement);
}

function is_completed() {
	return this.related('requirements')
		.every(requirement => requirement.get('is_completed'));
}

export const Task = Bookshelf.Model.extend({
	tableName: 'task',
	hasTimestamps: true,
	requirements,
	virtuals: {
		is_completed
	}
});
