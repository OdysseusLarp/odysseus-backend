import Bookshelf from '../../db';
import { Person } from './person';

/* eslint-disable object-shorthand */

const messageWithRelated = ['sender', 'receiver', 'channel'];

/**
 * @typedef {object} ComMessage
 * @property {integer} id.required - ID
 * @property {string} person_id.required - Person ID of the message sender
 * @property {string} target_person - Person ID of the receiver (if private message)
 * @property {string} target_channel - Channel ID of the receiver (if message to channel)
 * @property {string} message - Message body
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const ComMessage = Bookshelf.Model.extend({
	tableName: 'com_message',
	hasTimestamps: true,
	sender: function () {
		return this.hasOne(Person, 'id', 'person_id');
	},
	receiver: function () {
		return this.hasOne(Person, 'id', 'target_person');
	},
	channel: function () {
		return this.hasOne(ComChannel, 'id', 'target_channel');
	},
	fetchAllWithRelated: function () {
		return this.fetchAll({ withRelated: messageWithRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: messageWithRelated });
	},
	fetchPageWithRelated: function (page) {
		return this.orderBy('created_at').fetchPage({
			pageSize: 50,
			page,
			withRelated: messageWithRelated
		});
	}
});

/**
 * @typedef {object} ComChannel
 * @property {string} id.required - Channel ID
 * @property {string} description - Channel description
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const ComChannel = Bookshelf.Model.extend({
	tableName: 'com_channel',
	hasTimestamps: true,
});

/**
 * @typedef {object} ComChannelEvent
 * @property {integer} id.required - ID
 * @property {string} type - Event type
 * @property {object} metadata - Event metadata
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const ComChannelEvent = Bookshelf.Model.extend({
	tableName: 'com_channel_event',
	hasTimestamps: true
});

