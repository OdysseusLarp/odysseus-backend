import Bookshelf from '../../db';
import { Person } from './person';
import { getSocketIoClient } from '../index';
import { logger } from '../logger';

/* eslint-disable object-shorthand */

/**
 * @typedef VoteOption
 * @property {integer} id - ID
 * @property {integer} vote_id.required - Vote ID
 * @property {string} text.required - Description of the option
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const VoteOption = Bookshelf.Model.extend({
	tableName: 'vote_option',
	hasTimestamps: true
});

/**
 * @typedef VoteEntry
 * @property {string} person_id.required - Person ID
 * @property {integer} vote_id.required - Vote ID
 * @property {integer} vote_option_id.required - Vote option ID
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const VoteEntry = Bookshelf.Model.extend({
	tableName: 'vote_entry',
	idAttribute: 'person_id',
	hasTimestamps: true,
});

const voteWithRelated = ['author', 'entries', 'options'];

/**
 * @typedef Vote
 * @property {integer} id - ID
 * @property {string} person_id - ID of person who created the vote
 * @property {string} title.required - Title
 * @property {string} description.required - Description of what the vote is about
 * @property {string} status.required - Status (PENDING, APPROVED, REJECTED)
 * @property {boolean} is_active.required - Boolean stating if the vote is active or not
 * @property {boolean} is_public - Defines if the vote should be seen by only those who can vote
 * @property {integer} duration_minutes - How many minutes the vote will be active for after approved
 * @property {string} allowed_voters - String stating who is allowed to vote, e.g. EVERYONE, FULL_CITIZENSHIP, HIGH_RANKING_OFFICERS, DYNASTY:DYNASTY_NAME
 * @property {string} active_until - ISO 8601 String Date-time stating when voting will end
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const Vote = Bookshelf.Model.extend({
	tableName: 'vote',
	hasTimestamps: true,
	initialize() {
		this.on('created', model => {
			logger.success('Created new vote', model.get('id'), model.get('title'));
			getSocketIoClient().emit('voteAdded', model);
		});
		this.on('updated', model => {
			logger.success('Updated vote', model.get('id'));
			getSocketIoClient().emit('voteUpdated', model);
		});
	},
	author: function () {
		return this.hasOne(Person, 'id', 'person_id');
	},
	entries: function () {
		return this.hasMany(VoteEntry);
	},
	options: function () {
		return this.hasMany(VoteOption);
	},
	fetchAllWithRelated: function () {
		return this.orderBy('-is_active').orderBy('-created_at').fetchAll({ withRelated: voteWithRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: voteWithRelated });
	},
});

