import { Router } from 'express';
import { Artifact, ArtifactResearch } from '../models/artifact';
import { handleAsyncErrors } from '../helpers';
const router = new Router();

/**
 * Get a list of all science artifacts
 * @route GET /science/artifact
 * @group Artifact - Science artifact related operations
 * @returns {Array.<Artifact>} 200 - List of all science artifacts
 */
router.get('/artifact', handleAsyncErrors(async (req, res) => {
	// TODO: add pagination
	// TODO: allow request parameters to define if results should only
	// contain artifacts that have at least 1 research completed
	res.json(await Artifact.forge().fetchAllWithRelated());
}));

/**
 * Get a list of all science artifacts
 * @route GET /science/artifact/{id}
 * @group Artifact - Science artifact related operations
 * @param {integer} id.path.required -Artifact ID
 * @returns {Artifact.model} 200 - Specific artifact
 */
router.get('/artifact/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Artifact.forge({ id: req.params.id }).fetchWithRelated());
}));

/**
 * Update or insert science artifact
 * @route PUT /science/artifact
 * @consumes application/json
 * @group Artifact - Science artifact related operations
 * @param {Artifact.model} post.body.required - Artifact model to be updated or inserted
 * @returns {Artifact.model} 200 - Updated or inserted Artifact values
 */
router.put('/artifact', handleAsyncErrors(async (req, res) => {
	const { id } = req.body;
	// TODO: Validate input
	let artifact;
	if (id) artifact = await Artifact.forge({ id }).fetch();
	if (!artifact) {
		artifact = Artifact.forge().save(req.body, { method: 'insert' });
	} else {
		await artifact.save(req.body, { method: 'update' });
	}
	res.json(artifact);
}));

/**
 * Update or insert science artifact research
 * @route PUT /science/artifact/research
 * @consumes application/json
 * @group Artifact - Science artifact related operations
 * @param {ArtifactResearch.model} post.body.required - ArtifactResearch model to be updated or inserted
 * @returns {ArtifactResearch.model} 200 - Updated or inserted ArtifactResearch values
 */
router.put('/artifact/research', handleAsyncErrors(async (req, res) => {
	const { id } = req.body;
	// TODO: Validate input
	let artifactResearch;
	if (id) artifactResearch = await ArtifactResearch.forge({ id }).fetch();
	if (!artifactResearch) {
		artifactResearch = ArtifactResearch.forge().save(req.body, { method: 'insert' });
	} else {
		await artifactResearch.save(req.body, { method: 'update' });
	}
	res.json(artifactResearch);
}));

export default router;
