import Bookshelf from '../../db';
import { TaskRequirement } from './';

function requirements() {
	return this.hasMany(TaskRequirement);
}

export const Task = Bookshelf.Model.extend({
	tableName: 'task',
	hasTimestamps: true,
	requirements
});
