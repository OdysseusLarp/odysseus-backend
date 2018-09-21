import Bookshelf from '../../db';
import { Task, TaskRequirement } from './';

function tasks() {
	return this.belongsToMany(Task).through(TaskRequirement);
}

function requirements() {
	return this.belongsToMany(TaskRequirement);
}

export const Box = Bookshelf.Model.extend({
	tableName: 'box',
	hasTimestamps: true,
	tasks,
	requirements
});

