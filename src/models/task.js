import Bookshelf from '../../db';
import { TaskRequirement } from './';

export const Task = Bookshelf.Model.extend({
	tableName: 'task',
	requirements: function () {
		return this.hasMany(TaskRequirement);
	}
});
