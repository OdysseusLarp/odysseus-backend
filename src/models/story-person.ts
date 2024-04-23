import { z } from 'zod';
import { knex } from "@db/index";

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

export const StoryAdminPersonDetails = z.object({
	id: z.string(),
	link_to_character: z.string().nullable(),
	summary: z.string().nullable(),
	gm_notes: z.string().nullable(),
	shift: z.string().nullable(),
	role: z.string().nullable(),
	role_additional: z.string().nullable(),
	special_group: z.string().nullable(),
	character_group: z.string().nullable(),
	medical_elder_gene: z.boolean(),
});
export type StoryAdminPersonDetails = z.infer<typeof StoryAdminPersonDetails>;

const FormattedRelation = z.object({
	id: z.string(),
	name: z.string(),
	relation: z.string().nullable(),
	status: z.string(),
	ship: z.string().nullable(),
	is_character: z.boolean(),
});
type FormattedRelation = z.infer<typeof FormattedRelation>

export const StoryAdminPersonDetailsWithRelations = StoryAdminPersonDetails.extend({
		events: z.array(z.object({
			id: z.number(),
			name: z.string(),
		})),
		messages: z.array(z.object({
			id: z.number(),
			name: z.string(),
			direction: z.enum(['sender', 'receiver']),
		})),
		plots: z.array(z.object({
			id: z.number(),
			name: z.string(),
		})),
		relations: z.array(FormattedRelation),
});
export type StoryAdminPersonDetailsWithRelations = z.infer<typeof StoryAdminPersonDetailsWithRelations>;

const RelationsRow = z.object({
	first_person_id: z.string(),
	second_person_id: z.string(),
	relation: z.string().nullable(),
	first_person_name: z.string(),
	second_person_name: z.string(),
	first_person_ship_id: z.string().nullable(),
	second_person_ship_id: z.string().nullable(),
	first_person_is_character: z.boolean(),
	second_person_is_character: z.boolean(),
	first_person_status: z.string(),
	second_person_status: z.string(),
});

function parseRelation (userId: string, rawRow: any): FormattedRelation {
	const row = RelationsRow.parse(rawRow);
	const isRelationFirstPerson = row.second_person_id === userId;

	const id = isRelationFirstPerson ? row.first_person_id : row.second_person_id;
	const name = isRelationFirstPerson ? row.first_person_name : row.second_person_name;
	const status = isRelationFirstPerson ? row.first_person_status : row.second_person_status;
	const ship = isRelationFirstPerson ? row.first_person_ship_id : row.second_person_ship_id;
	const isCharacter = isRelationFirstPerson ? row.first_person_is_character : row.second_person_is_character;

	return FormattedRelation.parse({
		id,
		name,
		status,
		ship,
		is_character: isCharacter,
		relation: row.relation,
	});
}

export async function getStoryPersonDetails(id: string): Promise<StoryAdminPersonDetailsWithRelations | null> {
	const person = await knex('person').select('*').where({ id }).first();
	if (!person) {
		return null;
	}

	const [events, receivableMessage, sendableMessages, plots, relations] = await Promise.all([
		knex('story_person_events')
		.join('story_events', 'story_person_events.event_id', 'story_events.id')
		.select('story_events.id', 'story_events.name')
		.where({ person_id: id }),
		knex('story_person_messages')
		.join('story_messages', 'story_person_messages.message_id', 'story_messages.id')
		.select('story_messages.id', 'story_messages.name')
		.where({ person_id: id }),
		knex('story_messages').select("id", "name").where({ sender_person_id: id }),
		knex('story_person_plots')
		.join('story_plots', 'story_person_plots.plot_id', 'story_plots.id')
		.select('story_plots.id', 'story_plots.name')
		.where({ person_id: id }),
		knex('story_person_relations')
		.join('person as first_person', 'story_person_relations.first_person_id', 'first_person.id')
		.join('person as second_person', 'story_person_relations.second_person_id', 'second_person.id')
		.select(
			'story_person_relations.*',
			knex.raw('TRIM(CONCAT(first_person.first_name, \' \', first_person.last_name)) as first_person_name'),
			knex.raw('TRIM(CONCAT(second_person.first_name, \' \', second_person.last_name)) as second_person_name'),
			'first_person.ship_id as first_person_ship_id',
			'second_person.ship_id as second_person_ship_id',
			'first_person.is_character as first_person_is_character',
			'second_person.is_character as second_person_is_character',
			'first_person.status as first_person_status',
			'second_person.status as second_person_status',
		)
		.where({ first_person_id: id }).orWhere({ second_person_id: id }),
	]);

	const messages = [
		...sendableMessages.map((row) => ({ ...row, direction: "sender" })),
		...receivableMessage.map((row) => ({ ...row, direction: "receiver" }))
	];

	return StoryAdminPersonDetailsWithRelations.parse({
		...person,
		events,
		messages,
		plots,
		relations: relations.map((row) => parseRelation(id, row)),
	});
}
