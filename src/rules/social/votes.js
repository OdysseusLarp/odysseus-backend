import { interval } from '../helpers';
import { logger } from '../../logger';
import { Vote, VoteEntry, VoteOption } from '../../models/vote';
import { InfoEntry } from '../../models/infoentry';
import moment from 'moment';

const POLL_FREQUENCY_MS = 10000;

const closeVoteTimers = new Map();

async function closeVote(vote) {
	logger.info('Closing vote', vote.get('id'));
	await vote.save({ is_active: false }, { method: 'update', patch: true });
	await createVoteResultsInfoEntry(vote);
}

async function createVoteResultsInfoEntry(vote) {
	const voteEntries = await new VoteEntry().where('vote_id', vote.get('id')).fetchAll();
	const voteOptions = await new VoteOption().where('vote_id', vote.get('id')).fetchAll();

	const infoEntry = new InfoEntry();
	const activeMinutes = 60;
	const activeUntil = moment().add(activeMinutes, 'minutes').toDate();
	const postData = {
		priority: 1,
		enabled: true,
		title: 'Vote: ' + vote.get('title'),
		active_until: activeUntil,
	};

	const totalVotes = voteEntries.length;

	if (totalVotes === 0) {
		const body = 'No votes were cast.';
		const metadata = { vote_results: [] };
		await infoEntry.save({ ...postData, body, metadata }, { method: 'insert' });
		return;
	}

	const results = [];
	for (const option of voteOptions.models) {
		const votes = voteEntries.filter(single => single.get('vote_option_id') === option.get('id')).length;
		results.push({ option: option.get('text'), votes });
	}
	results.sort((a, b) => b.votes - a.votes);
	results.forEach(result => result.votesPercentage = Math.round((result.votes / results[0].votes) * 100));
	const votesWord = voteEntries.length === 1 ? 'vote' : 'votes';
	const body = `Vote results are in! ${totalVotes} ${votesWord} were cast. The winning option is <strong>${results[0].option}</strong> with ${results[0].votes} ${votesWord}.`;

	await infoEntry.save({
		...postData,
		body,
		metadata: { vote_results: results },
	}, { method: 'insert' });
}

async function processVotesScheduledToClose() {
	const activeVotes = await new Vote().where('is_active', true).fetchAll();
	closeVoteTimers.forEach(clearTimeout);
	closeVoteTimers.clear();
	for (const vote of activeVotes.models) {
		const closesIn = new Date(vote.get('active_until')) - Date.now();

		// Close right away if already expired
		if (closesIn < 1) return await closeVote(vote);

		// If there's more than 2x poll frequency remaining, don't bother with the interval
		if (closesIn > POLL_FREQUENCY_MS * 2) return;

		// Set an interval that closes the vote right when it's supposed to
		closeVoteTimers.set(
			vote.get('id'),
			setTimeout(() => closeVote(vote), closesIn)
		);
	}
}

// Update votes that are scheduled to close
interval(processVotesScheduledToClose, 10000);
