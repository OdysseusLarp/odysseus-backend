import { z } from 'zod';
import { knex } from "@db/index";

export const StoryArtifactRelations = z.object({
	id: z.number(),
	events: z.array(z.object({
		id: z.number(),
		name: z.string(),
	})),
	plots: z.array(z.object({
		id: z.number(),
		name: z.string(),
	})),
});
export type StoryArtifactRelations = z.infer<typeof StoryArtifactRelations>;

export async function getArtifactRelations(id: number): Promise<StoryArtifactRelations | null> {
	const artifact = await knex('artifact').select('*').where({ id }).first();
	if (!artifact) {
		return null;
	}

	const [events, plots] = await Promise.all([
		knex('story_artifact_events')
		.join('story_events', 'story_artifact_events.event_id', 'story_events.id')
		.select('story_events.id', 'story_events.name')
		.where({ artifact_id: id }),
		knex('story_artifact_plots')
		.join('story_plots', 'story_artifact_plots.plot_id', 'story_plots.id')
		.select('story_plots.id', 'story_plots.name')
		.where({ artifact_id: id }),
	]);

	return StoryArtifactRelations.parse({ id: artifact.id, events, plots, });
}
