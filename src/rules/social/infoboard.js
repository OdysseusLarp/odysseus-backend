import { interval } from '../helpers';
import { logger } from '../../logger';
import { InfoEntry } from '../../models/infoentry';

const POLL_FREQUENCY_MS = 10000;

const closeInfoentryTimers = new Map();

function closeInfoentry(infoentry) {
	logger.info('Closing Infoentry', infoentry.get('id'));
	return infoentry.save({ enabled: false }, { method: 'update', patch: true });
}

async function updateInfoentryScheduledToClose() {
	const activeInfoentry = await new InfoEntry().where('enabled', true).where('active_until', "!=", "").fetchAll();
	closeInfoentryTimers.forEach(timeout => clearTimeout(timeout));
	closeInfoentryTimers.clear();
	activeInfoentry.forEach(infoentry => {
		const closesIn = new Date(infoentry.get('active_until')) - Date.now();

		// Close right away if already expired
		if (closesIn < 1) return closeInfoentry(infoentry);

		// If there's more than 2x poll frequency remaining, don't bother with the interval
		if (closesIn > POLL_FREQUENCY_MS * 2) return;

		// Set an interval that closes the infoentry right when it's supposed to
		closeInfoentryTimers.set(infoentry.get('id'), setTimeout(() => closeInfoentry(infoentry), closesIn));
	});
}

// Update infoentrys that are scheduled to close
interval(updateInfoentryScheduledToClose, POLL_FREQUENCY_MS);
