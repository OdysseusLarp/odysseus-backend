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

export async function listStoryMessages(): Promise<StoryMessage[]> {
	const messages = await knex('story_messages').select('*');
	return StoryMessage.array().parse(messages);
}

export async function getStoryMessage(id: number): Promise<StoryMessage | null> {
	const message = await knex('story_messages').select('*').where({ id }).first();
	if (!message) {
		return null;
	}
	return StoryMessage.parse(message);
}
