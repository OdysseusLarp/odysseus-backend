import knexConfig from '../knexfile';

const knex = require('knex')(knexConfig);

/* eslint-disable-next-line no-unused-vars */
const Bookshelf = module.exports = require('bookshelf')(knex);
