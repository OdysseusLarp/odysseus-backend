import { Router, Request, Response } from 'express';
import { handleAsyncErrors } from './helpers';
import { getStoryPlot, listStoryPlots } from '@/models/story-plots';
import httpErrors from 'http-errors';
import { z } from 'zod';
import { getStoryEvent, listStoryEvents } from '@/models/story-events';
import { getStoryMessage, listStoryMessages } from '@/models/story-messages';
import { getStoryPersonDetails } from '@/models/story-person';

const router = Router();

const NumericIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive().int()),
});
const StringIdSchema = z.object({
	id: z.string(),
});

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
 * @param {integer} id.path.required - ID of the plot to get
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

export default router;
