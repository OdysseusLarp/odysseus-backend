import Bookshelf from '../../db';
import { Task, TaskRequirement } from './';

function tasks() {
	return this.belongsToMany(Task).through(TaskRequirement);
}

export const Box = Bookshelf.Model.extend({
	tableName: 'box',
	hasTimestamps: true,
	tasks
});

