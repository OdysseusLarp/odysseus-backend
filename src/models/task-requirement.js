import Bookshelf from '../../db';
import { Task } from './';

function task() {
	return this.belongsToMany(Task);
}

export const TaskRequirement = Bookshelf.Model.extend({
	tableName: 'task_requirement',
	hasTimestamps: true,
	task
});
