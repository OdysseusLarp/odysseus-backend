import Bookshelf from '../../db';

export const Box = Bookshelf.Model.extend({
	tableName: 'box',
	hasTimestamps: true
});
