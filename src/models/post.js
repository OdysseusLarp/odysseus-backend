import Bookshelf from '../../db';
import { getSocketIoClient } from '../websocket';
import { Person } from './person';
import { logger } from '../logger';

/* eslint-disable object-shorthand */

const postWithRelated = ['author'];

/**
 * @typedef Post
 * @property {integer} id - ID
 * @property {string} title.required - Title / Headline
 * @property {string} body.required - Post body
 * @property {string} person_id - Person ID of the author
 * @property {string} type.required - Post type (NEWS, OPINION...)
 * @property {string} status.required - Status (PENDING, APPROVED, REJECTED)
 * @property {boolean} is_visible.required - Boolean stating if the post is visible or not
 * @property {boolean} show_on_infoboard - Boolean stating if the post should be shown on infoboards
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const Post = Bookshelf.Model.extend({
	tableName: 'post',
	hasTimestamps: true,
	initialize() {
		// Emit during 'destroying' instead of 'destroyed' since 'destroyed' event
		// no longer has access to the model id
		this.on('destroying', model => {
			logger.success('Deleted post', model.get('id'));
			getSocketIoClient().emit('postDeleted', { id: model.get('id') });
		});
		this.on('created', model => {
			logger.success('Created new post', model.get('id'));
			getSocketIoClient().emit('postAdded', model);
		});
		this.on('updated', model => {
			logger.success('Updated post', model.get('id'));
			getSocketIoClient().emit('postUpdated', model);
		});
	},
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

