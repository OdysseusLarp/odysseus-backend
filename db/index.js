import knexConfig from '../knexfile';

const knex = require('knex')(knexConfig);


const Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('virtuals');
module.exports = Bookshelf;
