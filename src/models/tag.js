import Bookshelf from '../../db';
import { Person } from './person';
import { Artifact } from './artifact';

/* eslint-disable object-shorthand */

/**
 * @typedef Tag
 * @property {string} id.required - Tag ID (actual contents of the tag)
 * @property {string} type - Tag type
 * @property {string} description - Tag description
 * @property {object} metadata - JSON representation of any data related to the tag
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const Tag = Bookshelf.Model.extend({
	tableName: 'tag',
	hasTimestamps: true,
	operations: function () {
		return this.hasMany(OperationResult);
	},
	fetchAllWithRelated: function () {
		return this.fetchAll({ withRelated: ['operations'] });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: ['operations'] });
	},
});

const operationResultWithRelated = [
	'tag',
	'person',
	'artifact',
];

/**
 * @typedef OperationResult
 * @property {integer} id - ID
 * @property {string} bio_id - A bio_id of a person that this operation relates to
 * @property {string} catalog_id - A catalog_id of an artifact that this operation relates to
 * @property {string} tag_id - A tag_id of a tag that this operation relates to
 * @property {string} description - Operation description
 * @property {string} sample_id - E.g. a vial number
 * @property {object} type - Operation type
 * @property {object} metadata - JSON representation of any data related to the tag
 * @property {boolean} is_analysed - True when this operation needs no more work from players
 * @property {boolean} is_complete - True when this operation needs no more work from anyone (GMs included)
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const OperationResult = Bookshelf.Model.extend({
	tableName: 'operation_result',
	hasTimestamps: true,
	tag: function () {
		return this.hasOne(Tag, 'id', 'tag_id');
	},
	person: function () {
		return this.hasOne(Person, 'bio_id', 'bio_id');
	},
	artifact: function () {
		return this.hasOne(Artifact, 'catalog_id', 'catalog_id');
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: operationResultWithRelated });
	},
	fetchAllWithRelated: function () {
		return this.fetchAll({ withRelated: operationResultWithRelated });
	}
});
