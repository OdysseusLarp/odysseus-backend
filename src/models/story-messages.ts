import { z } from 'zod';
import { knex } from "@db/index";

/**
 * @typedef StoryMessage
 * @property {integer} id - ID
 * @property {string} name.required - Name
 * @property {string} sender_person_id - Sender person ID
 * @property {string} type.required - Types: Datahub message types: Text NPC, EVA, Hints for scientist, Fleet Coms, Fleet Secretary, Fleet Admiral Ship log messages News (Posted to Datahub
 * @property {integer} after_jump - The plot takes place after this jump number
 * @property {boolean} locked.required - If set to true, the plot should happen exactly at the jump number in "after_jump"
 * @property {string} sent.required - Possible values: 'Yes', 'No need', 'Not yet', 'Repeatable'
 * @property {string} message.required - Message
 * @property {string} gm_notes - GM notes
 */
export const StoryMessage = z.object({
	id: z.number(),
	name: z.string(),
	sender_person_id: z.string().nullable(),
	type: z.string(),
	after_jump: z.number().nullable(),
	locked: z.boolean(),
	sent: z.string(),
	message: z.string(),
	gm_notes: z.string().nullable(),
});
export type StoryMessage = z.infer<typeof StoryMessage>;

export const StoryMessagePersonLink = z.object({
	person_id: z.string(),
	message_id: z.number(),
});
export type StoryMessagePersonLink = z.infer<typeof StoryMessagePersonLink>;

export const StoryMessageWithRelations = StoryMessage.extend({
	events: z.array(z.object({
		id: z.number(),
		name: z.string(),
	})),
	persons: z.array(z.object({
		id: z.string(),
		name: z.string(),
	})),
	plots: z.array(z.object({
		id: z.number(),
		name: z.string(),
	})),
});
export type StoryMessageWithRelations = z.infer<typeof StoryMessageWithRelations>;

export async function listStoryMessages(): Promise<StoryMessage[]> {
	const messages = await knex('story_messages').select('*');
	return StoryMessage.array().parse(messages);
}

export async function getStoryMessage(id: number): Promise<StoryMessageWithRelations | null> {
	const message = await knex('story_messages').select('*').where({ id }).first();
	if (!message) {
		return null;
	}

	const [events, persons, plots] = await Promise.all([
		knex('story_event_messages')
		.join('story_events', 'story_event_messages.event_id', 'story_events.id')
		.select('story_events.id', 'story_events.name')
		.where({ message_id: id }),
		knex('story_person_messages')
		.join('person', 'story_person_messages.person_id', 'person.id')
		.select('person.id', knex.raw('TRIM(CONCAT(person.first_name, \' \', person.last_name)) as name'))
		.where({ message_id: id }),
		knex('story_plot_messages')
		.join('story_plots', 'story_plot_messages.plot_id', 'story_plots.id')
		.select('story_plots.id', 'story_plots.name')
		.where({ message_id: id }),
	]);

	return StoryMessageWithRelations.parse({
		...message,
		events,
		persons,
		plots,
	});
}
