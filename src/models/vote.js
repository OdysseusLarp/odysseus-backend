import Bookshelf from '../../db';
import { Person } from './person';

/* eslint-disable object-shorthand */

/**
 * @typedef {object} VoteOption
 * @property {integer} id.required - ID
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
 * @typedef {object} VoteEntry
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
 * @typedef {object} Vote
 * @property {integer} id.required - ID
 * @property {string} person_id - ID of person who created the vote
 * @property {string} title.required - Title
 * @property {string} description.required - Description of what the vote is about
 * @property {string} status.required - Status (PENDING, APPROVED, REJECTED)
 * @property {boolean} is_active.required - Boolean stating if the vote is active or not
 * @property {boolean} is_public - Defines if the vote should be seen by only those who can vote
 * @property {Array.<string>} allowed_groups - List of the group names that are allowed to vote
 * @property {string} active_until - ISO 8601 String Date-time stating when voting will end
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const Vote = Bookshelf.Model.extend({
	tableName: 'vote',
	hasTimestamps: true,
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
		return this.fetchAll({ withRelated: voteWithRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: voteWithRelated });
	},
});

