import { saveBlob } from '../helpers';

// DMX signals to turn sockets on or off using socket device IP.
saveBlob({
	type: 'tplink',
	id: 'dmxconfig',
	// List of objects { dmx: "LoungeFuseFixed", ip: "1.2.3.4", powerstate: true }
	signals: [], // TODO: Populate
});

// Device information, scanned regularly by backend based on 'dmxconfig' blob.
// Informational only, not used by backend.
saveBlob({
	type: 'tplink',
	id: 'deviceinfo',
	scanned_at: '1970-01-01T00:00:00.000Z',
	// IP address to information, containing e.g.
	// - `mac` (string)
	// - `alias` (name of device)
	// - `relay_state` (0 or 1)
	devices: {},
});
