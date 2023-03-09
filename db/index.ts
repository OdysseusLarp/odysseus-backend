import Bookshelf from 'bookshelf';
import Knex from 'knex';
import knexConfig from '../knexfile';

const knex = Knex(knexConfig);

const bookshelf = Bookshelf(knex);
bookshelf.plugin('bookshelf-virtuals-plugin');
module.exports = bookshelf;
