import Bookshelf from '../../db';
import { Task, TaskRequirement } from './';

export const Box = Bookshelf.Model.extend({
	tableName: 'box',
	tasks: function () {
		return this.belongsToMany(Task).through(TaskRequirement);
	}
});

