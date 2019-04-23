import { Router } from 'express';
import { Post } from '../models/post';
import { STATUS_PENDING, STATUS_APPROVED } from '../models';
import { handleAsyncErrors } from '../helpers';
import { pick } from 'lodash';
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
 * @returns {Post.model} 200 - Updated or inserted Post values
 */
router.put('/', handleAsyncErrors(async (req, res) => {
	const { id } = req.body;
	// TODO: Validate input
	const data = pick(req.body, ['title', 'body', 'person_id', 'type', 'status', 'is_visible']);
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
	}
	res.json(post);
}));

export default router;
