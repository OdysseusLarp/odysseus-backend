import { Router } from 'express';
import { Vote, VoteEntry } from '../models/vote';
import { handleAsyncErrors } from '../helpers';
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

export default router;
