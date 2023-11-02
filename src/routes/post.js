import { Router } from 'express';
import { Post } from '../models/post';
import { STATUS_PENDING, STATUS_APPROVED } from '../models';
import { handleAsyncErrors } from './helpers';
import { adminSendMessage } from '../messaging';
import { get, pick } from 'lodash';
import { logger } from '../logger';
const router = new Router();

/**
 * Get a list of all posts
 * @route GET /post
 * @group Post - Social Hub News/Opinion post related operations
 * @param {string} status.query - Limit query to Posts with specific status
 * @returns {Array.<Post>} 200 - List of all posts
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	const where = req.query.status ? { status: req.query.status } : {};
	res.json(await Post.forge().orderBy('-created_at').where(where).fetchAllWithRelated());
}));

/**
 * Get a specific post by post id
 * @route GET /post/{id}
 * @group Post - Social Hub News/Opinion post related operations
 * @param {integer} id.path.required - Post i
 * @returns {Post.model} 200 - Specific Post
 */
router.get('/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Post.forge({ id: req.params.id }).fetchWithRelated());
}));

/**
 * Update or insert post
 * @route PUT /post
 * @consumes application/json
 * @group Post - Social Hub News/Opinion post related operations
 * @param {Post.model} post.body.required - Post model to be updated or inserted
 * @param {boolean} sendMessage.query - True if post creator should receive "post approved/rejected" message on update
 * @returns {Post.model} 200 - Updated or inserted Post values
 */
router.put('/', handleAsyncErrors(async (req, res) => {
	const { id } = req.body;
	// TODO: Validate input
	const data = pick(req.body, ['title', 'body', 'person_id', 'type', 'status', 'is_visible', 'show_on_infoboard']);
	const sendMessage = get(req, 'query.sendMessage') === 'true';
	const isApproved = data.status === 'APPROVED';
	const isRejected = data.status === 'REJECTED';
	let post;
	if (id) post = await Post.forge({ id }).fetch();
	if (!post) {
		if (!data.status) data.status =
			data.type === 'CAPTAINS_LOG' ? STATUS_APPROVED : STATUS_PENDING;
		post = await Post.forge().save(data, { method: 'insert' });
		req.io.emit('postAdded', post);
	} else {
		await post.save(data, { method: 'update', patch: true });
		req.io.emit('postUpdated', post);
		if (sendMessage && (isApproved || isRejected)) {
			const message = isApproved ?
				`Your ${post.get('type').toLowerCase()} post '${post.get('title')}' was approved and released.` :
				`Your ${post.get('type').toLowerCase()} post '${post.get('title')}' was rejected and will not be published.`;

			// If fleet secretary messages themself, stuff breaks in very unexpected ways
			if (String(post.get('person_id')) === process.env.FLEET_SECRETARY_ID) {
				return logger.debug('Denying fleet secretary from messaging themself');
			}
			adminSendMessage(process.env.FLEET_SECRETARY_ID, {
				target: post.get('person_id'),
				type: 'private',
				message
			});
		}
	}
	res.json(post);
}));

export default router;
