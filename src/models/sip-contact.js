import Bookshelf from '../../db';

/* eslint-disable object-shorthand */

/**
 * @typedef SipContact
 * @property {string} id.required - ID and SIP number of this contact
 * @property {string} name - Contact display name
 * @property {string} type - Contact type, e.g. MEDBAY, BRIDGE
 * @property {boolean} video_allowed - True if video from/to this contact is allowed
 * @property {string} created_at - ISO 8601 String Date-time when object was created
 * @property {string} updated_at - ISO 8601 String Date-time when object was last updated
 */
export const SipContact = Bookshelf.Model.extend({
	tableName: 'sip_contact',
	hasTimestamps: true,
});
