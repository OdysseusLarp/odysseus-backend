import { logger } from '@/logger';
import store, { watch } from '@/store/store';
import { BigBattery, BigBatteryLocation } from '@/utils/bigbattery-helpers';
import { saveBlob } from '../helpers';

function depleteBattery() {
	const box: BigBattery = store.getState().data.box.bigbattery;
	if (!box) {
		logger.error('Big battery box not found');
		return;
	}

	if (box.capacity_percent <= 0) {
		return;
	}
	const depletion_percent = 100 / box.depletion_time_mins;
	const capacity_percent = Math.max(0, box.capacity_percent - depletion_percent);
	logger.info(`Depleting big battery to ${capacity_percent}%`);
	saveBlob({
		...box,
		capacity_percent,
	});
}

function updateActiveStatus() {
	const box: BigBattery = store.getState().data.box.bigbattery;
	if (!box) {
		logger.error('Big battery box not found');
		return;
	}

	// NOTE: This intentionally does not use isBatteryConnected since emergency overrides are undesired here
	let active = false;
	switch (box.connected_position) {
		case BigBatteryLocation.ENGINEERING:
			// Engineering is active when the ship is jumping
			active = store.getState().data.ship?.jump?.status === 'jumping';
			break;
		// TODO: Add conditions for active state in other locations
	}
	if (box.active !== active) {
		logger.info(`Big battery active status changed to ${active}`);
		saveBlob({
			...box,
			active,
		});
	}
}

setInterval(depleteBattery, 60000);

watch(['data', 'box', 'bigbattery'], updateActiveStatus);
watch(['data', 'ship', 'jump'], updateActiveStatus);
