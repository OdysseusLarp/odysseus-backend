import { logger } from '@/logger';
import { saveBlob } from '@/rules/helpers';
import store, { watch } from '@/store/store';
import e from 'express';

import { Client } from 'tplink-smarthome-api';

const client = new Client();

export async function scanTplinkDevices() {
	const dmxConfig = store.getState().data.tplink.dmxconfig;
	const ipaddresses = dmxConfig.signals.map(signal => signal.ip);
	const devices = {};
	for (let ip of ipaddresses) {
		try {
			logger.debug(`Scanning TP-link device: ${ip}`);
			const device = await client.getDevice({ host: ip });
			const info = await device.getSysInfo();
			logger.debug(`TP-link device found: ${ip} ${info.alias}`);
			devices[ip] = info;
		} catch (error) {
			logger.warn(`Error scanning TP-link device ${ip}: ${error}`);
			devices[ip] = { error: error.message };
		}
	}
	saveBlob({
		type: 'tplink',
		id: 'deviceinfo',
		scanned_at: new Date().toISOString(),
		devices,
	});
}

export async function processDmxSignal(signal: string): Promise<void> {
	try {
		// List of objects { dmx: "LoungeFuseFixed", ip: "1.2.3.4", powerstate: true }
		const dmxSignals = store.getState().data.tplink.dmxconfig.signals;
		for (let dmxSignal of dmxSignals) {
			if (dmxSignal.dmx === signal) {
				const ip = dmxSignal.ip;
				const device = await client.getDevice({ host: ip });
				logger.debug(
					`Based on DMX signal ${signal} setting TP-link device ${dmxSignal.ip} ${dmxSignal.powerstate ? 'ON' : 'OFF'}`
				);
				await device.setPowerState(dmxSignal.powerstate);
			}
		}
	} catch (error) {
		logger.error(`Error sending DMX signal ${signal} to TP-link devices: ${error}`);
	}
}

export function initializeTplinkScanning() {
	// Scan initially after 10 secs, then once every 10 mins, or whenever config changes
	setTimeout(scanTplinkDevices, 1000 * 10);
	setInterval(scanTplinkDevices, 1000 * 60 * 10);
	watch(['data', 'tplink', 'dmxconfig'], scanTplinkDevices);
}
