import { getEmptyEpsilonClient } from '@/integrations/emptyepsilon/client';
import { logger } from '@/logger';
import { watch } from '@/store/store';
import { throttle } from 'lodash';

const THROTTLE_INTERVAL_MS = 1000 * 2;
const MIN_DESIRED_HULL_HEALTH = 2;

async function repairHull(currentHealth, desiredHealth: number) {
	logger.info(`Hull health is ${currentHealth}, repairing to ${desiredHealth} health`);
	const client = getEmptyEpsilonClient();
	await client.setHullHealthPoints(desiredHealth);
}

const repairHullThrottled = throttle(repairHull, THROTTLE_INTERVAL_MS, {
	leading: false,
	trailing: true,
});

// Keep hull at above 1 health so that the next hit will cause the hull damage DMX to be triggered
async function autoRepairHull(current: Record<string, any>) {
	const hullHealth = current?.general?.shipHull;
	if (typeof hullHealth !== 'number') return;

	if (hullHealth < MIN_DESIRED_HULL_HEALTH) {
		await repairHullThrottled(hullHealth, MIN_DESIRED_HULL_HEALTH);
	} else {
		repairHullThrottled.cancel();
	}
}

watch(['data', 'ship', 'ee'], autoRepairHull);
