import { Router } from 'express';
import { Artifact, ArtifactEntry } from '../models/artifact';
import { handleAsyncErrors } from '../helpers';
import { getData, setData } from '../routes/data';
import { getEmptyEpsilonClient } from '../emptyepsilon';
import { get, set, cloneDeep, pick } from 'lodash';
import { shipLogger } from '../models/log';
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
 * Get a specific artifact by catalog id
 * @route GET /science/artifact/catalog/{catalog_id}
 * @group Artifact - Science artifact related operations
 * @param {string} catalog_id.path.required - Catalog ID
 * @returns {Artifact.model} 200 - Specific artifact
 */
router.get('/artifact/catalog/:id', handleAsyncErrors(async (req, res) => {
	res.json(await Artifact.forge().where({ catalog_id: req.params.id }).fetchWithRelated());
}));

/**
 * Get a specific artifact by artifact id
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
		artifact = await Artifact.forge().save(req.body, { method: 'insert' });
	} else {
		await artifact.save(req.body, { method: 'update', patch: true });
	}
	res.json(artifact);
}));

/**
 * Update or insert science artifact entry
 * @route PUT /science/artifact/entry
 * @consumes application/json
 * @group Artifact - Science artifact related operations
 * @param {ArtifactEntry.model} post.body.required - ArtifactEntry model to be updated or inserted
 * @returns {ArtifactEntry.model} 200 - Updated or inserted ArtifactEntry values
 */
router.put('/artifact/entry', handleAsyncErrors(async (req, res) => {
	const { id } = req.body;
	// TODO: Validate input
	let artifactEntry;
	if (id) artifactEntry = await ArtifactEntry.forge({ id }).fetch();
	if (!artifactEntry) {
		artifactEntry = ArtifactEntry.forge().save(req.body, { method: 'insert' });
	} else {
		await artifactEntry.save(req.body, { method: 'update', patch: true });
	}
	res.json(artifactEntry);
}));

/**
 * Trigger an artifact action using a secret code
 * @route PUT /science/artifact/use/{code}
 * @consumes application/json
 * @group Artifact - Science artifact related operations
 * @param {string} code.path.required - Super secret code that either triggers something or it doesn't
 * @returns {object} 200 - Object containing a message if the code did anything
 */
router.put('/artifact/use/:code', handleAsyncErrors(async (req, res) => {
	const data = cloneDeep(getData('misc', 'artifact_actions'));
	switch (req.params.code) {
		// No longer burn through jump crystals
		case 'CRYSTAL_GENERATOR': {
			const artifact = pick(get(data, 'actions.CRYSTAL_GENERATOR'), ['is_usable', 'is_used', 'log_message']);

			// Artifact can only be used once per game
			if (artifact.is_used) return res.json({ message: 'Artifact has already been used' });
			if (!artifact.is_usable) return res.json({ message: 'Artifact cannot be used at this time' });

			set(data, 'actions.CRYSTAL_GENERATOR', {
				...data.actions.CRYSTAL_GENERATOR,
				is_usable: false,
				is_used: true,
				used_at: Date.now()
			});
			setData('misc', 'artifact_actions', data);
			if (artifact.log_message) shipLogger.success(artifact.log_message, { showPopup: true });
			return res.json({ message: 'Artifact used. Jump crystals will now regenerate while jumping.' });
		}

		// Set ship hull health to 100%
		case 'HEALTH_BOOST': {
			const artifact = pick(get(data, 'actions.HEALTH_BOOST'), ['is_usable', 'is_used', 'log_message']);

			// Artifact can only used once per game
			if (artifact.is_used) return res.json({ message: 'Artifact has already been used' });
			if (!artifact.is_usable) return res.json({ message: 'Artifact cannot be used at this time' });

			// Check that we have connection to EE and state sync enabled
			const { isConnectionHealthy } = getEmptyEpsilonClient().getConnectionStatus();
			const { ee_sync_enabled } = getData('ship', 'metadata');
			if (!isConnectionHealthy || !ee_sync_enabled) return res.json(
				{ message: 'Artifact is ready to use, but connection to ship systems could not be established' }
			);

			// Set EE hull health to 100%
			getEmptyEpsilonClient().setHullHealthPercent(1).then(() => {
				set(data, 'actions.HEALTH_BOOST', {
					...data.actions.HEALTH_BOOST,
					is_usable: false,
					is_used: true,
					used_at: Date.now()
				});
				setData('misc', 'artifact_actions', data);
				if (artifact.log_message) shipLogger.success(artifact.log_message, { showPopup: true });
				return res.json({ message: 'Artifact used. Ship hull health was increased to 100%.' });
			}).catch(err =>
				res.json({ message: 'Error using the artifact, could not establish connection to ship systems. ' }));
			break;
		}
		default: {
			res.json({ message: 'Unknown code' });
		}
	}
}));

export default router;
