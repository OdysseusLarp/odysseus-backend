import Bookshelf from 'bookshelf';
import Knex from 'knex';
import knexConfig from '../knexfile';

const knex = Knex(knexConfig);

const bookshelf = Bookshelf(knex);
bookshelf.plugin('bookshelf-virtuals-plugin');

// Revert to old behaviour of returning a null instead of throwing a EmptyResponse error when no
// rows are found, undoing https://github.com/bookshelf/bookshelf/pull/2006
bookshelf.Model.prototype.requireFetch = false;

module.exports = bookshelf;
