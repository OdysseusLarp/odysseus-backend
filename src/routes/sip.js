import { Router } from 'express';
import { SipContact } from '../models/sip-contact';
import { handleAsyncErrors } from '../helpers';
import { NotFound } from 'http-errors';
import Bookshelf from '../../db';
const router = new Router();

/**
 * @typedef SipConfig
 * @property {string} url - SIP URL, e.g. wss://xxx.yyy:1234/ws
 * @property {string} realm - SIP Realm, e.g. xxx.yyy
 */

/**
 * Get SIP config
 * @route GET /sip/config
 * @group SIP - SIP Related operations
 * @returns {SipConfig} 200 - List of all SIP contacts
 */
router.get('/config', (req, res) => {
	res.json({
		url: process.env.SIP_URL || null,
		realm: process.env.SIP_REALM || null,
	});
});

/**
 * Get a list of all SIP contacts
 * @route GET /sip/contact
 * @group SIP - SIP Related operations
 * @returns {Array.<SipContact>} 200 - List of all SIP contacts
 */
router.get('/contact', handleAsyncErrors(async (req, res) => {
	res.json(await SipContact.forge().fetchAll());
}));

/**
 * Get a single SIP contact by ID
 * @route GET /sip/contact/{id}
 * @group SIP - SIP Related operations
 * @returns {Error} 404 - SipContact not found
 * @returns {SipContact.model} 200 - SipContact model
 */
router.get('/contact/:id', handleAsyncErrors(async (req, res) => {
	const sipContact = await SipContact.forge({ id: req.params.id }).fetchAll();
	if (!sipContact) throw new NotFound('Tag not found');
	res.json(sipContact);
}));

/**
 * Update or insert a SIP contact
 * @route PUT /sip/contact
 * @consumes application/json
 * @group SIP - SIP Related operations
 * @param {SipContact.model} sipcontact.body.required - SIP contact to be inserted/updated
 * @returns {SipContact.model} 200 - SipContact model
 */
router.put('/contact', handleAsyncErrors(async (req, res) => {
	const { id } = req.body;
	let sipContact;
	if (id) sipContact = await SipContact.forge({ id }).fetch();
	if (!sipContact) {
		sipContact = await Bookshelf.transaction(transacting =>
			SipContact.forge().save(req.body, { method: 'insert', transacting }));
	} else {
		await Bookshelf.transaction(transacting =>
			SipContact.forge().save(req.body, { method: 'update', transacting, patch: true }));
	}
	res.json(sipContact);
}));

export default router;
