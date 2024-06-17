import { Router } from 'express';
import { Vote, VoteEntry, VoteOption } from '../models/vote';
import { InfoEntry } from '../models/infoentry';
import { STATUS_PENDING } from '../models';
import { handleAsyncErrors } from './helpers';
import { adminSendMessage } from '../messaging';
import Bookshelf from '../../db';
import { pick, get, isInteger } from 'lodash';
import moment from 'moment';
import { NotFound } from 'http-errors';
import { logger } from '../logger';
import * as dmx from '../dmx';
const router = new Router();

const VOTE_FIELDS = [
	'title',
	'person_id',
	'description',
	'is_active',
	'is_public',
	'duration_minutes',
	'active_until',
	'allowed_voters',
	'status'
];

const voteFilterToTextMap = {
  'PARTY:BLUE_PARTY': 'Members of the Blue Party',
  'PARTY:PURPLE_PARTY': 'Members of the Purple Party',
  'PARTY:YELLOW_PARTY': 'Members of the Yellow Party',

  'RELIGION:OLD_WAYS': 'Followers of the Old Ways',
  'RELIGION:OTHER': 'Followers of the Other',
  'RELIGION:FAITH_OF_THE_HIGH_SCIENCE': 'Followers of the Faith of the High Science',

  'DYNASTY:TENACITY': 'Members of the Tenacity dynasty',
  'DYNASTY:LOGIC': 'Members of the Logic dynasty',
  'DYNASTY:GENEROSITY': 'Members of the Generosity dynasty',
  'DYNASTY:CONFIDENCE': 'Members of the Confidence dynasty',
  'DYNASTY:LOYALTY': 'Members of the Loyalty dynasty',
  'DYNASTY:UNITY': 'Members of the Unity dynasty',
  'DYNASTY:PURITY': 'Members of the Purity dynasty',
  'DYNASTY:TRANQUILITY': 'Members of the Tranquility dynasty',
  'DYNASTY:DEFIANCE': 'Members of the Defiance dynasty',
  'DYNASTY:KINDNESS': 'Members of the Kindness dynasty',
  'DYNASTY:DEDICATION': 'Members of the Dedication dynasty',
  'DYNASTY:INTELLIGENCE': 'Members of the Intelligence dynasty',
  'DYNASTY:COMPASSION': 'Members of the Compassion dynasty',
  'DYNASTY:STRENGTH': 'Members of the Strength dynasty',
  'DYNASTY:JUSTICE': 'Members of the Justice dynasty',
  'DYNASTY:EXCELLENCE': 'Members of the Excellence dynasty',
  'DYNASTY:MERCY': 'Members of the Mercy dynasty',
  'DYNASTY:FLOATER': 'Members of the Floater dynasty',
  'DYNASTY:FAIRNESS': 'Members of the Fairness dynasty',
  'DYNASTY:HOPE': 'Members of the Hope dynasty',
  'DYNASTY:INDUSTRY': 'Members of the Industry dynasty',
  'DYNASTY:AMBITION': 'Members of the Ambition dynasty',

	'HIGH_RANKING_OFFICER': 'High ranking military officers',

	'EVERYONE': 'Everyone',
};

const ONE_HOUR = 1000 * 60 * 60;

async function createVoteCreatedInfoboardEntry(vote) {
	const voteActiveUntilFormatted = moment(vote.get('active_until')).format('HH:mm');

	const voteActiveUntilMs = new Date(vote.get('active_until')).getTime();
	const oneHourMs = new Date(Date.now() + ONE_HOUR).getTime();
	const activeUntil = new Date(Math.min(voteActiveUntilMs, oneHourMs));

	const title = `Vote: ${vote.get('title')}`;
	const votingAllowedFor = voteFilterToTextMap[vote.get('allowed_voters')] || vote.get('allowed_voters');
	const body = `${votingAllowedFor} can now cast their vote in EOC Datahub.<br><br>Voting ends at ${voteActiveUntilFormatted}`;
	await InfoEntry.forge().save({
		priority: 1,
		enabled: true,
		title,
		body,
		active_until: activeUntil,
	}, { method: 'insert' });
}

/**
 * Get a list of all votes
 * @route GET /vote
 * @group Vote - Voting related operations
 * @param {string} status.query - Limit query to Posts with specific status
 * @returns {Array.<Vote>} 200 - List of all votes
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const where = req.query.status ? { status: req.query.status } : {};
	res.json(await Vote.forge().where(where).fetchAllWithRelated());
}));

/**
 * Get a specific vote by vote id
 * @route GET /vote/{id}
 * @group Vote - Voting related operations
 * @param {integer} id.path.required - Vote id
 * @returns {Vote.model} 200 - Specific Vote
 */
router.get('/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Vote.forge({ id: req.params.id }).fetchWithRelated());
}));

/**
 * Create a new vote with options
 * @route PUT /vote/create
 * @consumes application/json
 * @group Vote - Voting related operations
 * @param {Vote.model} vote.body.required - Vote model to be inserted
 * @returns {} 204 - OK
 */
router.put('/create', handleAsyncErrors(async (req, res) => {
	const options = get(req, 'body.options', []);
	if (!options.length) throw new Error('No vote options specified');

	const data = pick(req.body, VOTE_FIELDS);
	if (!data.status) data.status = STATUS_PENDING;

	await Bookshelf.transaction(async transacting => {
		const voteData = { ...data, is_active: data.status === 'APPROVED' };
		const vote = await Vote.forge().save(
			voteData,
			{ method: 'insert', transacting });
		return Promise.all(options.map(text =>
			VoteOption.forge().save(
				{ vote_id: vote.get('id'), text },
				{ method: 'insert', transacting })));
	});
	req.io.emit('voteCreated', null);
	res.sendStatus(204);
}));

/**
 * Update a vote by vote id
 * @route PUT /vote/{id}
 * @consumes application/json
 * @group Vote - Voting related operations
 * @param {integer} id.path.required - Vote id
 * @param {boolean} sendMessage.query - True if vote creator should receive "vote approved/rejected" message
 * @param {Vote.model} vote.body.required - VoteEntry model to be inserted
 * @returns {Vote.model} 200 - Updated Vote values
 */
router.put('/:id', handleAsyncErrors(async (req, res) => {
	const data = pick(req.body, VOTE_FIELDS);
	const sendMessage = get(req, 'query.sendMessage') === 'true';
	const isApproved = data.status === 'APPROVED';
	const isRejected = data.status === 'REJECTED';
	const vote = await Vote.forge({ id: req.params.id }).fetch();
	if (!vote) throw new NotFound('Vote not found');
	if (!data.active_until && data.status === 'APPROVED') {
		// Calculate when the voting time should run out
		const activeMinutes = vote.get('duration_minutes');
		data.active_until = isInteger(activeMinutes) ?
			moment().add(activeMinutes, 'minutes').toDate() :
			null;
	}
	const wasChangedToApproved = vote.get('status') !== 'APPROVED' && isApproved;
	await vote.save(data, { method: 'update', patch: true });
	if (sendMessage && (isApproved || isRejected)) {
		const message = isApproved ?
			`Your vote '${vote.get('title')}' was approved and released.` :
			`Your vote '${vote.get('title')}' was rejected and will not be published.`;
		// If fleet secretary messages themself, stuff breaks in very unexpected ways
		if (String(vote.get('person_id')) === process.env.FLEET_SECRETARY_ID) {
			return logger.debug('Denying fleet secretary from messaging themself');
		}
		if (wasChangedToApproved) {
			dmx.fireEvent(dmx.CHANNELS.DataHubVoteApproved);
			await createVoteCreatedInfoboardEntry(vote);
		}
		adminSendMessage(process.env.FLEET_SECRETARY_ID, {
			target: vote.get('person_id'),
			type: 'private',
			message
		});
	}
	res.json(vote);
}));

/**
 * Cast a vote
 * @route PUT /vote/{id}/cast
 * @consumes application/json
 * @group Vote - Voting related operations
 * @param {integer} id.path.required - Vote id
 * @param {VoteEntry.model} vote_entry.body.required - VoteEntry model to be inserted
 * @returns {VoteEntry.model} 200 - Inserted VoteEntry values
 */
router.put('/:id/cast', handleAsyncErrors(async (req, res) => {
	// TODO: Validate input (vote_option_id needs to be in vote options, person must not have voted yet)
	const vote = await Vote.forge({ id: req.params.id }).fetch();
	if (!vote.get('is_active')) throw new Error('This vote is no longer active');
	const voteEntry = await VoteEntry.forge().save(req.body, { method: 'insert' });
	res.json(voteEntry);
}));

export default router;
