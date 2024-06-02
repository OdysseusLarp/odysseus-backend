import { z } from 'zod';
import { knex } from "@db/index";
import { omit } from 'lodash';

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
	name: z.string().trim(),
	sender_person_id: z.string().nullable(),
	type: z.string(),
	after_jump: z.number().nullable(),
	locked: z.boolean(),
	sent: z.string(),
	message: z.string().trim(),
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
	plots: z.array(z.object({
		id: z.number(),
		name: z.string(),
	})),
	receivers: z.array(z.object({
		card_id: z.string().optional(),
		id: z.string(),
		name: z.string(),
		is_character: z.boolean(),
	})),
	sender: z.object({
		card_id: z.string().optional(),
		id: z.string(),
		name: z.string(),
		is_character: z.boolean(),
	}).or(z.null()),
});
export type StoryMessageWithRelations = z.infer<typeof StoryMessageWithRelations>;

export const StoryMessageWithPersons = StoryMessage.extend({
	receivers: z.array(z.object({
		id: z.string(),
		name: z.string(),
	})),
	sender: z.object({
		id: z.string(),
		name: z.string(),
	}).or(z.null()),
});
export type StoryMessageWithPersons = z.infer<typeof StoryMessageWithPersons>;

export async function listStoryMessages(): Promise<StoryMessageWithPersons[]> {
	const messages = await knex('story_messages').select('story_messages.*', knex.raw('TRIM(CONCAT(person.first_name, \' \', person.last_name)) as sender_name')).leftJoin('person', 'story_messages.sender_person_id', 'person.id')
	const storyPersonMessage = await knex('story_person_messages').select('story_person_messages.*', knex.raw('TRIM(CONCAT(person.first_name, \' \', person.last_name)) as name')).join('person', 'story_person_messages.person_id', 'person.id')
	messages.forEach(message => {
		const receivers = storyPersonMessage.filter(({ message_id }) => message.id === message_id).map(({ person_id, name }) => ({ id: person_id, name }));
		message.receivers = receivers;
		if (message.sender_person_id) {
			message.sender =  {
				id: message.sender_person_id,
				name: message.sender_name,
			};
		} else {
			message.sender = null;
		}
	});
	return StoryMessageWithPersons.array().parse(messages);
}

export async function getStoryMessage(id: number): Promise<StoryMessageWithRelations | null> {
	const message = await knex('story_messages').select('story_messages.*', 'person.card_id', 'person.is_character', knex.raw('TRIM(CONCAT(person.first_name, \' \', person.last_name)) as sender_name')).leftJoin('person', 'story_messages.sender_person_id', 'person.id').where('story_messages.id', "=", id).first();
	if (!message) {
		return null;
	}

	const [events, receivers, plots] = await Promise.all([
		knex('story_event_messages')
		.join('story_events', 'story_event_messages.event_id', 'story_events.id')
		.select('story_events.id', 'story_events.name')
		.where({ message_id: id }),
		knex('story_person_messages')
		.join('person', 'story_person_messages.person_id', 'person.id')
		.select('person.id', 'person.card_id', 'person.is_character', knex.raw('TRIM(CONCAT(person.first_name, \' \', person.last_name)) as name'))
		.where({ message_id: id }),
		knex('story_plot_messages')
		.join('story_plots', 'story_plot_messages.plot_id', 'story_plots.id')
		.select('story_plots.id', 'story_plots.name')
		.where({ message_id: id }),
	]);

	return StoryMessageWithRelations.parse({
		...message,
		events,
		receivers,
		plots,
		sender: message.sender_person_id ? {
			card_id: message.card_id,
			id: message.sender_person_id,
			name: message.sender_name,
			is_character: message.is_character,
		} : null,
	});
}

export const StoryMessageCreate = StoryMessage.extend({
	id: z.number().int().positive().optional(),
	receivers: z.array(z.string()),
	plots: z.array(z.number()),
	events: z.array(z.number()),
});
export type StoryMessageCreate = z.infer<typeof StoryMessageCreate>;

export async function upsertStoryMessage(message: StoryMessageCreate): Promise<number> {
	const trx = await knex.transaction();
	const msg = omit(message, ['receivers', 'events', 'plots']);
	const [{ id }] = await trx('story_messages').insert(msg).onConflict('id').merge().returning('id');
	await trx('story_person_messages').where({ message_id: id }).delete();
	if (message.receivers && message.receivers.length > 0) {
		await trx('story_person_messages').insert(message.receivers.map((person_id) => ({ message_id: id, person_id })));
	}
	await trx('story_event_messages').where({ message_id: id }).delete();
	if (message.events && message.events.length > 0) {
		await trx('story_event_messages').insert(message.events.map((event_id) => ({ message_id: id, event_id })));
	}
	await trx('story_plot_messages').where({ message_id: id }).delete();
	if (message.plots && message.plots.length > 0) {
		await trx('story_plot_messages').insert(message.plots.map((plot_id) => ({ message_id: id, plot_id })));
	}
	await trx.commit();
	return id;
}
