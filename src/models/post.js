import Bookshelf from '../../db';
import { Person } from './person';

/* eslint-disable object-shorthand */

const postWithRelated = ['author'];

/**
 * @typedef {object} Post
 * @property {integer} id.required - ID
 * @property {string} title.required - Title / Headline
 * @property {string} body.required - Post body
 * @property {string} person_id - Person ID of the author
 * @property {string} type.required - Post type (NEWS, OPINION...)
 * @property {boolean} is_visible.required - Boolean stating if the post is visible or not
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const Post = Bookshelf.Model.extend({
	tableName: 'post',
	hasTimestamps: true,
	author: function () {
		return this.hasOne(Person, 'id', 'person_id');
	},
	fetchAllWithRelated: function () {
		return this.fetchAll({ withRelated: postWithRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: postWithRelated });
	},
});

