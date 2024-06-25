import { saveBlob } from '../helpers';

// DMX signals to turn sockets on or off using socket device IP.
saveBlob({
	type: 'tplink',
	id: 'dmxconfig',
	// List of objects { dmx: "LoungeFuseFixed", ip: "1.2.3.4", powerstate: true }
	signals: [
		// Medbay examination light broken by Medbay fuse
		{ dmx: 'MedbayFuseBroken', ip: '172.30.4.70', powerstate: false },
		{ dmx: 'MedbayFuseFixed', ip: '172.30.4.70', powerstate: true },
		// Science lab research lights broken by Science fuse
		{ dmx: 'ScienceFuseBroken', ip: '172.30.4.71', powerstate: false },
		{ dmx: 'ScienceFuseFixed', ip: '172.30.4.71', powerstate: true },
		// Security room security camera displays broken by Lounge fuse
		{ dmx: 'LoungeFuseBroken', ip: '172.30.4.72', powerstate: false },
		{ dmx: 'LoungeFuseFixed', ip: '172.30.4.72', powerstate: true },
		// Engine room (right) displays broken by Engineering fuse
		{ dmx: 'EngineeringFuseBroken', ip: '172.30.4.73', powerstate: false },
		{ dmx: 'EngineeringFuseFixed', ip: '172.30.4.73', powerstate: true },
		// Engine room (right) plasma ball broken by Thermic Fusion Regulator / kick box task
		{ dmx: 'ThermicFusionRegulatorBroken', ip: '172.30.4.74', powerstate: false },
		{ dmx: 'ThermicFusionRegulatorFixed', ip: '172.30.4.74', powerstate: true },
	],
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
