import { interval } from '../helpers';
import { logger } from '../../logger';
import { InfoEntry } from '../../models/infoentry';
import { getTotalSoulsAlive } from '../../models/ship';

const POLL_FREQUENCY_MS = 10000;

const closeInfoEntryTimers = new Map();

async function closeInfoEntry(infoEntry) {
	logger.info(`Setting InfoEntry '${infoEntry.get('title')}' as inactive`);
	await infoEntry.save({ enabled: false }, { method: 'update', patch: true });
}

async function processScheduledInfoEntries() {
	const activeInfoEntries = await new InfoEntry()
		.where('enabled', true)
		.where('active_until', 'is not', null)
		.fetchAll();
	closeInfoEntryTimers.forEach(clearTimeout);
	closeInfoEntryTimers.clear();
	for (const infoEntry of activeInfoEntries.models) {
		const closesIn = new Date(infoEntry.get('active_until')) - Date.now();

		// Close right away if already expired
		if (closesIn < 1) return await closeInfoEntry(infoEntry);

		// If there's more than 2x poll frequency remaining, don't bother with the interval
		if (closesIn > POLL_FREQUENCY_MS * 2) return;

		// Set an interval that closes the infoentry right when it's supposed to
		closeInfoEntryTimers.set(
			infoEntry.get('id'),
			setTimeout(() => closeInfoEntry(infoEntry), closesIn)
		);
	}
}

async function updateSurvivorsCount() {
	const [entry, totalSoulsAlive] = await Promise.all([
		InfoEntry.forge({ identifier: 'survivors-count' }).fetch(),
		getTotalSoulsAlive(),
	]);
	if (!entry) {
		logger.warn("Survivors count info entry not found, can't update survivors count");
		return;
	}
	const body = entry.get('body');
	const replacement = `<span class="survivors">${totalSoulsAlive}</span>`;
	const pattern = /<span class="survivors">.*?<\/span>/;
	const updatedBody = body.replace(pattern, replacement);
	await entry.save({ body: updatedBody }, { method: 'update', patch: true });
}

// Process info entries that are scheduled to close
interval(processScheduledInfoEntries, POLL_FREQUENCY_MS);

// Update survivors count periodically
interval(updateSurvivorsCount, POLL_FREQUENCY_MS);
