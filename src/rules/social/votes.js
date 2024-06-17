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
	const activeUntil = moment().add(60, 'minutes').toDate();
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

		// No one cared about the vote so no one will care about the results, only show for 10min
		const shortActiveTime = moment().add(10, 'minutes').toDate();

		await infoEntry.save({ ...postData, body, metadata, active_until: shortActiveTime }, { method: 'insert' });
		return;
	}

	const results = [];
	for (const option of voteOptions.models) {
		const votes = voteEntries.filter(single => single.get('vote_option_id') === option.get('id')).length;
		results.push({ option: option.get('text'), votes });
	}
	results.sort((a, b) => b.votes - a.votes);
	results.forEach(result => result.votesPercentage = Math.round((result.votes / results[0].votes) * 100));

	const tiedResults = results.filter(result => result.votes === results[0].votes);
	const votesWord = voteEntries.length === 1 ? 'vote' : 'votes';
	let body = "";
	if (tiedResults.length === 2) {
		body = `Vote results are in! ${totalVotes} ${votesWord} were cast. There was a tie between <strong>${tiedResults[0].option}</strong> and <strong>${tiedResults[1].option}</strong> with ${tiedResults[0].votes} ${tiedResults[0].votes === 1 ? "vote" : "votes"} each.`;
	} else if (tiedResults.length > 2) {
		body = `Vote results are in! ${totalVotes} ${votesWord} were cast. There was a tie between multiple options with ${tiedResults[0].votes} ${tiedResults[0].votes === 1 ? "vote" : "votes"} each.`;
	} else {
		body = `Vote results are in! ${totalVotes} ${votesWord} ${totalVotes === 1 ? "was" : "were"} cast. The winning option is <strong>${results[0].option}</strong> with ${results[0].votes} ${votesWord}.`;
	}

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
