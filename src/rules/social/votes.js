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
	const infoEntry = new InfoEntry();
	const activeMinutes = 60;
	const activeUntil = moment().add(activeMinutes, 'minutes').toDate();
	const voteEntries = await new VoteEntry().where('vote_id', vote.get('id')).fetchAll();
	const voteOptions = await new VoteOption().where('vote_id', vote.get('id')).fetchAll();

	const title = 'Vote results: ' + vote.get('title');
	let body = 'No votes were cast.';
	if (voteEntries.length > 0) {
		body = 'Votes in total: ' + voteEntries.length + '</br>Winning vote option(s):';
		const resultArray = [];
		let winnerVotes = 0;
		voteOptions.forEach(option => {
			const votes = voteEntries.filter(single => single.get('vote_option_id') === option.get('id')).length;
			if (votes > winnerVotes) {
				winnerVotes = votes;
			}
			resultArray.push({ result: votes, option: option.get('text') });
		});

		const winningVote = resultArray.find(({ result }) => result === winnerVotes);
		body += '</br>' + winningVote.option + ' : ' + winningVote.result;
	}

	const postData = {
		priority: 1,
		enabled: true,
		title: title,
		body: body,
		active_until: activeUntil,
	};
	await infoEntry.save(postData, { method: 'insert' });
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
