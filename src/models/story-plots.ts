import { z } from 'zod';
import { knex } from "@db/index";

/**
 * @typedef StoryPlot
 * @property {integer} id - ID
 * @property {string} name.required - Name
 * @property {string} character_groups - Character groups
 * @property {string} size - Size
 * @property {string} themes - Themes
 * @property {string} importance - Importance
 * @property {string} gm_actions - GM actions
 * @property {boolean} text_npc_first_message - If true, a GM needs to send the initial message to the player
 * @property {integer} after_jump - The plot takes place after this jump number
 * @property {boolean} locked - If set to true, the plot should happen exactly at the jump number in "after_jump"
 * @property {string} description - Description
 * @property {string} gm_notes - GM notes
 * @property {string} copy_from_characters - Copy from characters
 */
export const StoryPlot = z.object({
	id: z.number(),
	name: z.string(),
	character_groups: z.string().nullable(),
	size: z.string().nullable(),
	themes: z.string().nullable(),
	importance: z.string().nullable(),
	gm_actions: z.string().nullable(),
	text_npc_first_message: z.boolean(),
	after_jump: z.number().nullable(),
	locked: z.boolean(),
	description: z.string().nullable(),
	gm_notes: z.string().nullable(),
	copy_from_characters: z.string().nullable(),
});
export type StoryPlot = z.infer<typeof StoryPlot>;

export const StoryPlotEventLink = z.object({
	plot_id: z.number(),
	event_id: z.number(),
});
export type StoryPlotEventLink = z.infer<typeof StoryPlotEventLink>;

export const StoryPlotArtifactLink = z.object({
	plot_id: z.number(),
	artifact_id: z.number(),
});
export type StoryPlotArtifactLink = z.infer<typeof StoryPlotArtifactLink>;

export const StoryPlotPersonLink = z.object({
	plot_id: z.number(),
	person_id: z.string(),
});
export type StoryPlotPersonLink = z.infer<typeof StoryPlotPersonLink>;

export const StoryPlotMessagesLink = z.object({
	plot_id: z.number(),
	message_id: z.number(),
});
export type StoryPlotMessagesLink = z.infer<typeof StoryPlotMessagesLink>;

export const StoryPlotWithRelations = StoryPlot.extend({
	artifacts: z.array(z.object({
		id: z.number(),
		name: z.string(),
	})),
	events: z.array(z.object({
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
});
export type StoryPlotWithRelations = z.infer<typeof StoryPlotWithRelations>;

export async function listStoryPlots(): Promise<StoryPlot[]> {
	const plots = await knex('story_plots').select('*');
	return StoryPlot.array().parse(plots);
}

export async function getStoryPlot(id: number): Promise<StoryPlot | null> {
	const plot = await knex('story_plots').select('*').where({ id }).first();
	if (!plot) {
		return null;
	}

	const [artifacts, events, messages, persons] = await Promise.all([
		knex('story_artifact_plots')
		.join('artifact', 'story_artifact_plots.artifact_id', 'artifact.id')
		.select('artifact.name', 'artifact.id')
		.where({ plot_id: id }),
		knex('story_event_plots')
		.join('story_events', 'story_event_plots.event_id', 'story_events.id')
		.select('story_events.id', 'story_events.name')
		.where({ plot_id: id }),
		knex('story_plot_messages')
		.join('story_messages', 'story_plot_messages.message_id', 'story_messages.id')
		.select('story_messages.id', 'story_messages.name')
		.where({ plot_id: id }),
		knex('story_person_plots')
		.join('person', 'story_person_plots.person_id', 'person.id')
		.select('person.id', knex.raw('TRIM(CONCAT(person.first_name, \' \', person.last_name)) as name'))
		.where({ plot_id: id }),
	]);

	return StoryPlotWithRelations.parse({
		...plot,
		artifacts,
		events,
		messages,
		persons,
	});
}
