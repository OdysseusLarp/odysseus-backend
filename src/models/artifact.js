import Bookshelf from '../../db';
import { Person } from './person';

/* eslint-disable object-shorthand */

/**
 * @typedef ArtifactEntry
 * @property {integer} id - ID
 * @property {integer} artifact_id.required - Artifact ID
 * @property {string} person_id - ID of the person who inserted the entry
 * @property {string} entry - Entry details text
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const ArtifactEntry = Bookshelf.Model.extend({
	tableName: 'artifact_entry',
	hasTimestamps: true,
	artifact: function () {
		return this.hasOne(Artifact, 'id', 'artifact_id');
	},
	person: function () {
		return this.hasOne(Person, 'id', 'person_id');
	},
});

const artifactWithRelated = [
	'entries',
	{ 'entries.person': qb => qb.columns('id', 'first_name', 'last_name' ) }
];


/**
 * @typedef Artifact
 * @property {integer} id - ID
 * @property {string} catalog_id - Catalog ID
 * @property {string} name.required - Name
 * @property {string} discovered_by - Name of the person who discovered this artifact
 * @property {string} discovered_at - Name of the location where this artifact was discovered
 * @property {string} discovered_from - Discovered from
 * @property {string} type - Artifact type
 * @property {string} text - Text description of the artifact
 * @property {string} gm_notes - GM notes
 * @property {boolean} is_visible - Is the artifact visible to players
 * @property {string} test_material - Test results from material test
 * @property {string} test_microscope - Test results from microscope test
 * @property {integer} test_age - Test results from age test
 * @property {string} test_history - Test results from history test
 * @property {string} test_xrf - Test results from xrf test
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const Artifact = Bookshelf.Model.extend({
	tableName: 'artifact',
	hasTimestamps: true,
	entries: function () {
		return this.hasMany(ArtifactEntry);
	},
	fetchAllWithRelated: function (isVisible) {
		if (typeof isVisible === 'boolean') {
			return this.where({ is_visible: isVisible }).fetchAll({ withRelated: artifactWithRelated });
		}
		return this.orderBy('-created_at').fetchAll({ withRelated: artifactWithRelated });
	},
	fetchWithRelated: function () {
		return this.fetch({ withRelated: artifactWithRelated });
	},
});
