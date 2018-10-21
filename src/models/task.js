import Bookshelf from '../../db';

export const Task = Bookshelf.Model.extend({
	tableName: 'task',
	hasTimestamps: true
});
