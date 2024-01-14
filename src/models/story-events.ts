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

export const listStoryEvents = async (): Promise<StoryEvent[]> => {
	const events = await knex('story_events').select('*');
	return StoryEvent.array().parse(events);
}

export const getStoryEvent = async (id: number): Promise<StoryEvent | null> => {
	const event = await knex('story_events').select('*').where({ id }).first()
	if (!event) {
		return null;
	}
	return StoryEvent.parse(event);
}
