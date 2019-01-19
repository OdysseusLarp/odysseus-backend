import { Router } from 'express';
import { Vote, VoteEntry, VoteOption } from '../models/vote';
import { handleAsyncErrors } from '../helpers';
import Bookshelf from '../../db';
import { pick, get, isInteger } from 'lodash';
import moment from 'moment';
const router = new Router();

/**
 * Get a list of all votes
 * @route GET /vote
 * @group Vote - Voting related operations
 * @returns {Array.<Vote>} 200 - List of all votes
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	res.json(await Vote.forge().fetchAllWithRelated());
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

	// Create vote
	const data = pick(req.body, ['title', 'person_id', 'description']);

	// Calculate when the voting time runs out
	const activeTime = parseInt(get(req, 'body.activeTime'), 10);
	const activeUntil = isInteger(activeTime) ?
		moment().add(activeTime, 'minutes').toDate() :
		null;

	await Bookshelf.transaction(async transacting => {
		const vote = await Vote.forge().save(
			{ ...data, is_active: true, active_until: activeUntil },
			{ method: 'insert', transacting });
		return Promise.all(options.map(text =>
			VoteOption.forge().save(
				{ vote_id: vote.get('id'), text },
				{ method: 'insert', transacting })));
	});
	res.sendStatus(204);
}));

export default router;
