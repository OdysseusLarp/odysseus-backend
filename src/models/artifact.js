import Bookshelf from '../../db';
import { Person } from './person';

/* eslint-disable object-shorthand */

/**
 * @typedef {object} ArtifactResearch
 * @property {integer} id - ID
 * @property {integer} artifact_id.required - Artifact ID
 * @property {string} person_id - ID of the Person who performed the research
 * @property {string} discovered_by - How this was discovered, e.g. HANSCA_DNA, HANSCA_XRAY
 * @property {string} text.required - Research results as text
 * @property {boolean} is_visible.required - Boolean stating if the research is visible or not
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const ArtifactResearch = Bookshelf.Model.extend({
	tableName: 'artifact_research',
	hasTimestamps: true,
	discoverer: function () {
		return this.hasOne(Person, 'id', 'person_id');
	}
});

const artifactWithRelated = ['research', 'research.discoverer'];

/**
 * @typedef {object} Artifact
 * @property {integer} id - ID
 * @property {string} name.required - Name
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const Artifact = Bookshelf.Model.extend({
	tableName: 'artifact',
	hasTimestamps: true,
	research: function () {
		return this.hasMany(ArtifactResearch);
	},
	fetchAllWithRelated: function () {
		return this.fetchAll({ withRelated: artifactWithRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: artifactWithRelated });
	},
});
