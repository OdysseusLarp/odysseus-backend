import { interval } from '../helpers';
import { logger } from '../../logger';
import { Vote, VoteEntry, VoteOption } from '../../models/vote';
import { InfoEntry } from '../../models/infoentry';
import moment from 'moment';
import { isInteger } from 'lodash';

const POLL_FREQUENCY_MS = 10000;

const closeVoteTimers = new Map();

function closeVote(vote) {
	logger.info('Closing vote', vote.get('id'));
	const closeVote = vote.save({ is_active: false }, { method: 'update', patch: true });
	resultsInfoEntry(vote);
	return closeVote;
}


async function resultsInfoEntry(vote) {
	const infoentry = new InfoEntry();
	const activeMinutes = 60;
	const active_until = isInteger(activeMinutes) ? moment().add(activeMinutes, 'minutes').toDate() : null;
	const voteEntries = await new VoteEntry().where('vote_id', vote.get('id')).fetchAll();
	const voteOptions = await new VoteOption().where('vote_id', vote.get('id')).fetchAll();
	const infoTitle = "Vote results: " + vote.get('title');
	let voteResults;
if (voteEntries.length > 0){
	voteResults = "Votes in total: " + voteEntries.length + "</br>Winning vote option(s):";
	const resultArray =  [];
	let winnerVotes = 0;
	voteOptions.forEach(option => {
		let votes = voteEntries.filter(single => single.get('vote_option_id') === option.get('id')).length;
		let text = option.get('text');
		if (votes > winnerVotes){
			winnerVotes = votes;
		}
		let optionResult = {result:votes, option:text}
		resultArray.push(optionResult);	
	});
	let sortedArray = resultArray.sort((a, b) => b.result - a.result);

	sortedArray.forEach(result => {
		if (result.result == winnerVotes){
			voteResults += "</br>" + result.option + " : " + result.result;
		}
	});
} else {
	voteResults = "No votes casted."
}
	const postData = { "priority": 1, "enabled": true, "title": infoTitle, "body": voteResults, "active_until": active_until };
	const postInfo = infoentry.save(postData, { method: 'insert' });
	return;
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