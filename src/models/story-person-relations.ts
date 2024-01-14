import { z } from 'zod';

/**
 * @typedef StoryPersonRelations
 * @property {string} first_person_id - First person ID
 * @property {string} second_person_id - Second person ID
 * @property {string} relation - Relation
 */
export const StoryPersonRelation = z.object({
	first_person_id: z.string().nullable(),
	second_person_id: z.string().nullable(),
	relation: z.string().nullable(),
});
export type StoryPersonRelation = z.infer<typeof StoryPersonRelation>;
