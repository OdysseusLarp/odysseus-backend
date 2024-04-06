import { Router, Request, Response } from 'express';
import { handleAsyncErrors } from './helpers';
import { StoryPlotCreate, getStoryPlot, listStoryPlots, upsertStoryPlot } from '@/models/story-plots';
import httpErrors from 'http-errors';
import { z } from 'zod';
import { StoryEventCreate, getStoryEvent, listStoryEvents, upsertStoryEvent } from '@/models/story-events';
import { StoryMessageCreate, getStoryMessage, listStoryMessages, upsertStoryMessage } from '@/models/story-messages';
import { getStoryPersonDetails } from '@/models/story-person';
import { getArtifactRelations } from '@/models/story-artifact';
import { StatusCodes } from '@/utils/http';

const router = Router();

const NumericIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive().int()),
});
const StringIdSchema = z.object({
	id: z.string(),
});
const ObjectWithId = z.object({
	id: z.number(),
});

/**
 * @typedef ObjectWithId
 * @property {integer} id - ID of the object
 */

/**
 * Get artifact relations by ID
 * @route GET /story/artifact/{id}
 * @group Story admin - Story admin related operations
 * @param {integer} id.path.required - ID of the artifact to get
 */
router.get('/artifact/:id', handleAsyncErrors(async (req: Request, res: Response) => {
	const { id } = NumericIdSchema.parse(req.params);
	const artifactRelations = await getArtifactRelations(id);
	if (!artifactRelations) {
		throw new httpErrors.NotFound(`Artifact with ID ${id} not found`);
	}
	res.json(artifactRelations);
}));

/**
 * Get a list of all events
 * @route GET /story/events
 * @group Story admin - Story admin related operations
 * @returns {Array.<StoryEvent>} 200 - List of all StoryEvent models
 */
router.get('/events', handleAsyncErrors(async (req: Request, res: Response) => {
	const events = await listStoryEvents();
	res.json(events);
}));

/**
 * Get an event by ID
 * @route GET /story/events/{id}
 * @group Story admin - Story admin related operations
 * @param {integer} id.path.required - ID of the event to get
 */
router.get('/events/:id', handleAsyncErrors(async (req: Request, res: Response) => {
	const { id } = NumericIdSchema.parse(req.params);
	const event = await getStoryEvent(id);
	if (!event) {
		throw new httpErrors.NotFound(`Event with ID ${id} not found`);
	}
	res.json(event);
}));

/**
 * Upsert an event
 * @route POST /story/events
 * @group Story admin - Story admin related operations
 * @returns {ObjectWithId} 200 - Object containing the ID of the upserted event
 */
router.post('/events', handleAsyncErrors(async (req: Request, res: Response) => {
	const body = StoryEventCreate.parse(req.body);
	const id = await upsertStoryEvent(body);
	res.send(ObjectWithId.parse({ id }));
}));

/**
 * Get a list of all messages
 * @route GET /story/messages
 * @group Story admin - Story admin related operations
 * @returns {Array.<StoryMessage>} 200 - List of all StoryMessage models
 */
router.get('/messages', handleAsyncErrors(async (req: Request, res: Response) => {
	const messages = await listStoryMessages();
	res.json(messages);
}));

/**
 * Get a message by ID
 * @route GET /story/messages/{id}
 * @group Story admin - Story admin related operations
 * @param {integer} id.path.required - ID of the message to get
 * @returns {StoryMessage.model} 200 - StoryMessage model
 */
router.get('/messages/:id', handleAsyncErrors(async (req: Request, res: Response) => {
	const { id } = NumericIdSchema.parse(req.params);
	const message = await getStoryMessage(id);
	if (!message) {
		throw new httpErrors.NotFound(`Message with ID ${id} not found`);
	}
	res.json(message);
}));

/**
 * Upsert a message
 * @route POST /story/messages
 * @group Story admin - Story admin related operations
 * @returns {ObjectWithId} 200 - Object containing the ID of the upserted message
 */
router.post('/messages', handleAsyncErrors(async (req: Request, res: Response) => {
	const body = StoryMessageCreate.parse(req.body);
	const id = await upsertStoryMessage(body);
	res.send(ObjectWithId.parse({ id }));
}));

/**
 * Get a person by ID
 * @route GET /story/person/{id}
 * @group Story admin - Story admin related operations
 * @param {string} id.path.required - ID of the person to get
 * @returns {object} 200 - StoryAdminPersonDetailsWithRelations model
 */
router.get('/person/:id', handleAsyncErrors(async (req: Request, res: Response) => {
	const { id } = StringIdSchema.parse(req.params);
	const person = await getStoryPersonDetails(id);
	if (!person) {
		throw new httpErrors.NotFound(`Person with ID ${id} not found`);
	}
	res.json(person);
}));

/**
 * Get a list of all plots
 * @route GET /story/plots
 * @group Story admin - Story admin related operations
 * @returns {Array.<StoryPlot>} 200 - List of all StoryPlot models
 */
router.get('/plots', async (req: Request, res: Response) => {
	const plots = await listStoryPlots();
	res.json(plots);
});

/**
 * Get a plot by ID
 * @route GET /story/plots/{id}
 * @group Story admin - Story admin related operations
 * @returns {StoryPlot.model} 200 - StoryPlot model
 */
router.get('/plots/:id', handleAsyncErrors(async (req: Request, res: Response) => {
	const { id } = NumericIdSchema.parse(req.params);
	const plot = await getStoryPlot(id);
	if (!plot) {
		throw new httpErrors.NotFound(`Plot with ID ${id} not found`);
	}
	res.json(plot);
}));

/**
 * Upsert a plot
 * @route POST /story/plots
 * @group Story admin - Story admin related operations
 * @returns {ObjectWithId} 200 - Object containing the ID of the upserted plot
 */
router.post('/plots', handleAsyncErrors(async (req: Request, res: Response) => {
	const body = StoryPlotCreate.parse(req.body);
	const id = await upsertStoryPlot(body);
	res.send(ObjectWithId.parse({ id }));
}));

export default router;
