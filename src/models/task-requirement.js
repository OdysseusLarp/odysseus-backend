import Bookshelf from '../../db';
import { Task } from './';

export const TaskRequirement = Bookshelf.Model.extend({
	tableName: 'task_requirement',
	task: function () {
		return this.belongsToMany(Task);
	}
});
