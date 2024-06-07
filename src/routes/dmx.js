import { CHANNELS, fireEvent, DMX_MAX_CHANNEL, DMX_MAX_VALUE } from '../dmx';
import httpErrors from 'http-errors';
import { isFinite } from 'lodash';
import { Router } from 'express';
export const router = new Router();

/**
 * Get all known DMX channels.
 *
 * @route GET /dmx/channels
 * @group DMX - DMX operations
 * @returns {object} 200 - Map of all channel names + channel numbers
 */
router.get('/channels', (req, res) => {
	res.json(CHANNELS);
});

/**
 * Fires an event (value for one second, then back to zero) on a DMX channel.
 *
 * @route POST /dmx/event/{channel}
 * @group DMX - DMX operations
 * @param {string} channel.path.required - Channel to fire event (either number or textual)
 * @param {string} value.query - Value to fire (default 255)
 * @returns {object} 200 - Success
 * @returns {Error}  400 - Bad channel
 */
router.post('/event/:channel', (req, res) => {
	const { channel } = req.params;
	let { value } = req.query;

	let channelInt = CHANNELS[channel];
	if (!channelInt) {
		channelInt = parseInt(channel, 10);
	}
	if (!channel || !channelInt || !isFinite(channelInt) || channelInt < 0 || channelInt > DMX_MAX_CHANNEL) {
		throw new httpErrors.BadRequest(`Invalid channel number`);
	}

	if (typeof value !== 'undefined') {
		value = parseInt(value, 10);
		if (!isFinite(value) || value <= 0 || value > DMX_MAX_VALUE) {
			throw new httpErrors.BadRequest(`Invalid value`);
		}
	}

	fireEvent(channelInt, value);
	res.json({});
});

export default router;
