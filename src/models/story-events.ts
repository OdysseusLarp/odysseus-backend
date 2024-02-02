import { z } from 'zod';
import { knex } from "@db/index";

/**
 * @typedef StoryEvent
 * @property {integer} id - ID
 * @property {string} name.required - Name
 * @property {string} character_groups - Character groups
 * @property {string} size - Size
 * @property {string} importance - Importance
 * @property {integer} dmx_event_num - DMX event number
 * @property {string} type - Type
 * @property {string} gm_actions - GM actions
 * @property {integer} after_jump - The plot takes place after this jump number
 * @property {boolean} locked - If set to true, the plot should happen exactly at the jump number in "after_jump"
 * @property {string} status - Status
 * @property {string} npc_location - NPC location
 * @property {integer} npc_count - NPC count
 * @property {string} description - Description
 * @property {string} gm_note_npc - GM note NPC
 * @property {string} gm_notes - GM notes
 */
export const StoryEvent = z.object({
	id: z.number(),
	name: z.string(),
	character_groups: z.string().nullable(),
	size: z.string().nullable(),
	importance: z.string().nullable(),
	dmx_event_num: z.number().nullable(),
	type: z.string().nullable(),
	gm_actions: z.string().nullable(),
	after_jump: z.number().nullable(),
	locked: z.boolean(),
	status: z.string().nullable(),
	npc_location: z.string().nullable(),
	npc_count: z.number(),
	description: z.string().nullable(),
	gm_note_npc: z.string().nullable(),
	gm_notes: z.string().nullable(),
});
export type StoryEvent = z.infer<typeof StoryEvent>;

export const StoryEventArtifactLink = z.object({
	event_id: z.number(),
	artifact_id: z.number(),
});
export type StoryEventArtifactLink = z.infer<typeof StoryEventArtifactLink>;

export const StoryEventPersonLink = z.object({
	event_id: z.number(),
	person_id: z.string(),
});
export type StoryEventPersonLink = z.infer<typeof StoryEventPersonLink>;

export const StoryEventMessagesLink = z.object({
	event_id: z.number(),
	message_id: z.number(),
});
export type StoryEventMessagesLink = z.infer<typeof StoryEventMessagesLink>;

export const StoryEventWithRelations = StoryEvent.extend({
	artifacts: z.array(z.object({
		id: z.number(),
		name: z.string(),
	})),
	messages: z.array(z.object({
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
export type StoryEventWithRelations = z.infer<typeof StoryEventWithRelations>;

export const listStoryEvents = async (): Promise<StoryEvent[]> => {
	const events = await knex('story_events').select('*');
	return StoryEvent.array().parse(events);
}

export const getStoryEvent = async (id: number): Promise<StoryEventWithRelations | null> => {
	const event = await knex('story_events').select('*').where({ id }).first()
	if (!event) {
		return null;
	}

	const [artifacts, persons, messages, plots] = await Promise.all([
		knex('story_artifact_events')
		.join('artifact', 'story_artifact_events.artifact_id', 'artifact.id')
		.select('artifact.name', 'artifact.id')
		.where({ event_id: id }),
		knex('story_person_events')
		.join('person', 'story_person_events.person_id', 'person.id')
		.select('person.id', knex.raw('TRIM(CONCAT(person.first_name, \' \', person.last_name)) as name'))
		.where({ event_id: id }),
		knex('story_event_messages')
		.join('story_messages', 'story_event_messages.message_id', 'story_messages.id')
		.select('story_messages.id', 'story_messages.name')
		.where({ event_id: id }),
		knex('story_event_plots')
		.join('story_plots', 'story_event_plots.plot_id', 'story_plots.id')
		.select('story_plots.id', 'story_plots.name')
		.where({ event_id: id }),
	]);

	return StoryEventWithRelations.parse({
		...event,
		artifacts,
		persons,
		messages,
		plots,
	});
}
