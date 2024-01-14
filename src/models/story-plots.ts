import { z } from 'zod';

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
