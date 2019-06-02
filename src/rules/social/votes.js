import { interval } from '../helpers';
import { logger } from '../../logger';
import { Vote } from '../../models/vote';

const POLL_FREQUENCY_MS = 10000;

const closeVoteTimers = new Map();

function closeVote(vote) {
	logger.info('Closing vote', vote.get('id'));
	return vote.save({ is_active: false }, { method: 'update', patch: true });
}

async function updateVotesScheduledToClose() {
	const activeVotes = await new Vote().where('is_active', true).fetchAll();
	closeVoteTimers.forEach(timeout => clearTimeout(timeout));
	closeVoteTimers.clear();
	activeVotes.forEach(vote => {
		const closesIn = new Date(vote.get('active_until')) - Date.now();

		// Close right away if already expired
		if (closesIn < 1) return closeVote(vote);

		// If there's more than 2x poll frequency remaining, don't bother with the interval
		if (closesIn > POLL_FREQUENCY_MS * 2) return;

		// Set an interval that closes the vote right when it's supposed to
		closeVoteTimers.set(vote.get('id'), setTimeout(() => closeVote(vote), closesIn));
	});
}

// Update votes that are scheduled to close
interval(updateVotesScheduledToClose, 10000);