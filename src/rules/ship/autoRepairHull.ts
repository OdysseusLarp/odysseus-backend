import { getEmptyEpsilonClient } from '@/integrations/emptyepsilon/client';
import { logger } from '@/logger';
import { watch } from '@/store/store';
import { throttle } from 'lodash';

const THROTTLE_INTERVAL_MS = 2000;

async function repairHull(health: number) {
	const client = getEmptyEpsilonClient();
	await client.setHullHealthPoints(health);
}

const repairHullThrottled = throttle(repairHull, THROTTLE_INTERVAL_MS);

// Keep hull at above 0 health so that the next hit will cause the hull damage DMX to be triggered
async function autoRepairHull(current: Record<string, any>, previous: Record<string, any>) {
	const hullHealth = current?.general?.shipHull;
	if (typeof hullHealth !== 'number') return;
	if (hullHealth < 1) {
		logger.info(`Hull health is ${hullHealth}, repairing to 1 health...`);
		await repairHullThrottled(1);
	} else {
		repairHullThrottled.cancel();
	}
}

watch(['data', 'ship', 'ee'], autoRepairHull);
