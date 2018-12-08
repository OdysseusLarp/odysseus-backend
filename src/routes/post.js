import { Router } from 'express';
import { Post } from '../models/post';
import { handleAsyncErrors } from '../helpers';
const router = new Router();

/**
 * Get a list of all posts
 * @route GET /post
 * @group Post - Social Hub News/Opinion post related operations
 * @returns {Array.<Post>} 200 - List of all posts
 */
router.get('/', handleAsyncErrors(async (req, res) => {
	res.json(await Post.forge().fetchAllWithRelated());
}));

/**
 * Get a specific post by post id
 * @route GET /post/{id}
 * @group Post - Social Hub News/Opinion post related operations
 * @param {integer} id.path.required - Post id
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
	let post;
	if (id) post = await Post.forge({ id }).fetch();
	if (!post) {
		post = Post.forge().save(req.body, { method: 'insert' });
		req.io.emit('postAdded', post);
	} else {
		await post.save(req.body, { method: 'update' });
		req.io.emit('postUpdated', post);
	}
	res.json(post);
}));

export default router;
