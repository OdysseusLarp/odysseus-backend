import { logger } from '@/logger';
import { saveBlob } from '@/rules/helpers';
import store, { watch } from '@/store/store';

import { Client } from 'tplink-smarthome-api';

const client = new Client();

export async function scanTplinkDevices() {
	const dmxConfig = store.getState().data.tplink?.dmxconfig;
	if (!dmxConfig) {
		logger.debug('No TP-link DMX config found');
		return;
	}

	const ipaddresses: string[] = dmxConfig.signals.map(signal => signal.ip);
	const uniqueIpAddresses = [...new Set(ipaddresses)];
	const devices = {};
	for (let ip of uniqueIpAddresses) {
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
	if (process.env.DISABLE_TPLINK_SCANNING) {
		logger.info('TP-link scanning is disabled');
		return;
	}

	// List of objects { dmx: "LoungeFuseFixed", ip: "1.2.3.4", powerstate: true }
	const dmxSignals = store.getState().data.tplink?.dmxconfig?.signals;
	if (!dmxSignals) {
		logger.debug('No TP-link DMX signals configured');
		return;
	}

	for (let dmxSignal of dmxSignals) {
		if (dmxSignal.dmx === signal) {
			setTimeout(async () => {
				try {
					logger.info(
						`Based on DMX signal ${signal} setting TP-link device ${dmxSignal.ip} ${dmxSignal.powerstate ? 'ON' : 'OFF'}`
					);
					const ip = dmxSignal.ip;
					const device = await client.getDevice({ host: ip });
					await device.setPowerState(dmxSignal.powerstate);
				} catch (error) {
					logger.error(`Error sending DMX signal ${signal} to TP-link devices: ${error}`);
				}
			});
		}
	}
}

export function initializeTplinkScanning() {
	if (process.env.DISABLE_TPLINK_SCANNING) {
		logger.info('TP-link scanning is disabled');
		return;
	}

	// Scan initially after 10 secs, then once every 10 mins, or whenever config changes
	setTimeout(scanTplinkDevices, 1000 * 10);
	setInterval(scanTplinkDevices, 1000 * 60 * 10);
	watch(['data', 'tplink', 'dmxconfig'], scanTplinkDevices);
}
