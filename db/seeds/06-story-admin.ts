import csv from "csvtojson";
import path from "path";
import { Knex } from "knex";
import { z } from "zod";
import { parsedBoolean, parseCommaSeparatedString, trimmedStringOrNull, parsedIntOrNull } from "../../src/utils/parsing";
import { StoryPlot, StoryPlotEventLink, StoryPlotArtifactLink, StoryPlotPersonLink, StoryPlotMessagesLink } from "../../src/models/story-plots";
import { StoryEvent, StoryEventArtifactLink, StoryEventMessagesLink, StoryEventPersonLink } from "../../src/models/story-events";
import { StoryMessage, StoryMessagePersonLink } from "../../src/models/story-messages";
import { StoryPersonRelation } from "../../src/models/story-person";

const OptionalString = z.preprocess(trimmedStringOrNull, z.string().nullable());
const OptionalInt = z.preprocess(parsedIntOrNull, z.number().nullable());
const ParsedArray = z.preprocess(parseCommaSeparatedString, z.string().array());
const ParsedBoolean = z.preprocess(parsedBoolean, z.boolean());

const PlotCsvRow = z.object({
	id: z.preprocess(parsedIntOrNull, z.number()),
	name: z.string(),
	character_groups: OptionalString,
	character_ids: ParsedArray,
	event_ids: ParsedArray,
	artifact_ids: ParsedArray,
	size: OptionalString,
	themes: OptionalString,
	importance: OptionalString,
	gm_actions: OptionalString,
	text_npc_first_message: ParsedBoolean,
	after_jump: OptionalInt,
	locked: ParsedBoolean,
	description: OptionalString,
	gm_notes: OptionalString,
	copy_from_characters: OptionalString,
});
type PlotCsvRow = z.infer<typeof PlotCsvRow>;

const EventCsvRow = z.object({
	id: z.preprocess(parsedIntOrNull, z.number()),
	name: z.string(),
	character_groups: OptionalString,
	character_ids: ParsedArray,
	artifact_ids: ParsedArray,
	size: OptionalString,
	importance: OptionalString,
	dmx_event_num: OptionalInt,
	type: OptionalString,
	gm_actions: OptionalString,
	after_jump: OptionalInt,
	locked: ParsedBoolean,
	status: OptionalString,
	npc_location: OptionalString,
	npc_count: OptionalInt.default(0),
	description: OptionalString,
	gm_note_npc: OptionalString,
	gm_notes: OptionalString,
});
type EventCsvRow = z.infer<typeof EventCsvRow>;

const MessageCsvRow = z.object({
	id: z.preprocess(parsedIntOrNull, z.number()),
	name: z.string(),
	sender_character_id: OptionalString,
	reciever_character_ids: ParsedArray,
	plot_ids: ParsedArray,
	event_ids: ParsedArray,
	type: z.string().min(1),
	after_jump: OptionalInt,
	locked: ParsedBoolean,
	sent: z.string(),
	message: z.string(),
	gm_notes: OptionalString,
});
type MessageCsvRow = z.infer<typeof MessageCsvRow>;

const RelationCsvRow = z.object({
character_or_npc_1: z.string(),
character_or_npc_2: z.string(),
relation: z.string(),
});
type RelationCsvRow = z.infer<typeof RelationCsvRow>;

async function getPlots(): Promise<PlotCsvRow[]> {
	const csvPath = path.join(__dirname, "..", "data", "plots.csv");
	const rawData = await csv().fromFile(csvPath);
	return PlotCsvRow.array().parse(rawData);
}

async function getEvents(): Promise<EventCsvRow[]> {
	const csvPath = path.join(__dirname, "..", "data", "events.csv");
	const rawData = await csv().fromFile(csvPath);
	return EventCsvRow.array().parse(rawData);
}

async function getMessages(): Promise<MessageCsvRow[]> {
	const csvPath = path.join(__dirname, "..", "data", "messages.csv");
	const rawData = await csv().fromFile(csvPath);
	return MessageCsvRow.array().parse(rawData);
}

async function getRelations(): Promise<RelationCsvRow[]> {
	const csvPath = path.join(__dirname, "..", "data", "relations.csv");
	const rawData = await csv().fromFile(csvPath);
	return RelationCsvRow.array().parse(rawData);
}

function plotCsvRowToStoryPlot(row: PlotCsvRow): StoryPlot {
	return {
		id: row.id,
		name: row.name,
		character_groups: row.character_groups,
		size: row.size,
		themes: row.themes,
		importance: row.importance,
		gm_actions: row.gm_actions,
		text_npc_first_message: row.text_npc_first_message,
		after_jump: row.after_jump,
		locked: row.locked,
		description: row.description,
		gm_notes: row.gm_notes,
		copy_from_characters: row.copy_from_characters,
	};
}

function eventCsvRowToStoryEvent(row: EventCsvRow): StoryEvent {
	return {
		id: row.id,
		name: row.name,
		character_groups: row.character_groups,
		size: row.size,
		importance: row.importance,
		dmx_event_num: row.dmx_event_num,
		type: row.type,
		gm_actions: row.gm_actions,
		after_jump: row.after_jump,
		locked: row.locked,
		status: row.status,
		npc_location: row.npc_location,
		npc_count: row.npc_count ?? 0,
		description: row.description,
		gm_note_npc: row.gm_note_npc,
		gm_notes: row.gm_notes,
	};
}

function messageCsvRowToStoryMessage(row: MessageCsvRow): StoryMessage {
	return {
		id: row.id,
		name: row.name,
		sender_person_id: row.sender_character_id,
		type: row.type,
		after_jump: row.after_jump,
		locked: row.locked,
		sent: row.sent,
		message: row.message,
		gm_notes: row.gm_notes,
	};
}

function getStoryPlotEventLinks(plots: PlotCsvRow[]): StoryPlotEventLink[] {
	return plots.flatMap(plot => plot.event_ids.map(event_id => ({
		plot_id: plot.id,
		event_id: parseInt(event_id, 10),
	})));
}

function getStoryPlotPersonLinks(plots: PlotCsvRow[]): StoryPlotPersonLink[] {
	return plots.flatMap(plot => plot.character_ids.map(person_id => ({
		plot_id: plot.id,
		person_id,
	})));
}

function getEventPersonLinks(events: EventCsvRow[]): StoryEventPersonLink[] {
	return events.flatMap(event => event.character_ids.map(person_id => ({
		event_id: event.id,
		person_id,
	})));
}

async function getStoryPlotArtifactLinks(plots: PlotCsvRow[], knex: Knex): Promise<StoryPlotArtifactLink[]> {
	const artifacts = await knex('artifact').select('id', 'catalog_id');

	return plots.flatMap(plot => plot.artifact_ids.map(catalogId => {
		const artifact = artifacts.find(a => a.catalog_id === catalogId);
		if (!artifact?.id) {
			throw new Error(`Could not find artifact with catalog ID ${catalogId}`);
		}

		return { plot_id: plot.id, artifact_id: artifact.id, };
	}));
}

async function getStoryEventArtifactLinks(events: EventCsvRow[], knex: Knex): Promise<StoryEventArtifactLink[]> {
	const artifacts = await knex('artifact').select('id', 'catalog_id');

	return events.flatMap(event => event.artifact_ids.map(catalogId => {
		const artifact = artifacts.find(a => a.catalog_id === catalogId);
		if (!artifact?.id) {
			throw new Error(`Could not find artifact with catalog ID ${catalogId}`);
		}

		return { event_id: event.id, artifact_id: artifact.id, };
	}));
}

function getStoryEventMessageLinks(messages: MessageCsvRow[]): StoryEventMessagesLink[] {
	return messages.flatMap(message => message.event_ids.map(event_id => ({
		event_id: parseInt(event_id, 10),
		message_id: message.id,
	})));
}

function getStoryPlotMessageLinks(messages: MessageCsvRow[]): StoryPlotMessagesLink[] {
	return messages.flatMap(message => message.plot_ids.map(plot_id => ({
		plot_id: parseInt(plot_id, 10),
		message_id: message.id,
	})));
}

function getStoryMessagePersonLinks(messages: MessageCsvRow[]): StoryMessagePersonLink[] {
	return messages.flatMap(message => message.reciever_character_ids.map(person_id => ({
		message_id: message.id,
		person_id,
	})));
}

async function getPersonIdByFullName(fullName: string, knex: Knex): Promise<string> {
  const person = await knex('person')
    .select('id')
    .whereRaw('?? || \' \' || ?? = ?', ['first_name', 'last_name', fullName])
    .first();

  if (!person?.id) {
    throw new Error(`Person '${fullName}' not found`);
  }

  return person.id;
}

async function getStoryPersonRelationLinks(relations: RelationCsvRow[], knex: Knex): Promise<StoryPersonRelation[]> {
	const storyPersonRelations: StoryPersonRelation[] = [];
	for (const relation of relations) {
		const [firstPersonId, secondPersonId] = await Promise.all([
			getPersonIdByFullName(relation.character_or_npc_1, knex),
			getPersonIdByFullName(relation.character_or_npc_2, knex),
		]);

		storyPersonRelations.push({
			first_person_id: firstPersonId,
			second_person_id: secondPersonId,
			relation: relation.relation,
		});
	}

	return storyPersonRelations;
}

export const seed = async (knex: Knex) => {
	await knex('story_person_messages').del();
	await knex('story_plot_messages').del();
	await knex('story_event_messages').del();
	await knex('story_person_events').del();
	await knex('story_artifact_events').del();
	await knex('story_artifact_plots').del();
	await knex('story_person_plots').del();
	await knex('story_event_plots').del();

	await knex('story_person_relations').del();
	await knex('story_messages').del();
	await knex('story_events').del();
	await knex('story_plots').del();
	await knex.raw('ALTER SEQUENCE story_person_relations_id_seq RESTART WITH 1');

	const [plots, events, messages, relations] = await Promise.all([
		getPlots(),
		getEvents(),
		getMessages(),
		getRelations(),
	]);

	await knex('story_plots').insert(plots.map(plotCsvRowToStoryPlot));
	await knex('story_events').insert(events.map(eventCsvRowToStoryEvent));
	await knex('story_messages').insert(messages.map(messageCsvRowToStoryMessage));
	await knex('story_person_relations').insert(await getStoryPersonRelationLinks(relations, knex));

	await knex('story_event_plots').insert(getStoryPlotEventLinks(plots));
	await knex('story_person_plots').insert(getStoryPlotPersonLinks(plots));
	await knex('story_artifact_plots').insert(await getStoryPlotArtifactLinks(plots, knex));
	await knex('story_artifact_events').insert(await getStoryEventArtifactLinks(events, knex));
	await knex('story_person_events').insert(getEventPersonLinks(events));
	await knex('story_event_messages').insert(getStoryEventMessageLinks(messages));
	await knex('story_plot_messages').insert(getStoryPlotMessageLinks(messages));
	await knex('story_person_messages').insert(getStoryMessagePersonLinks(messages));

	// Fix primary key sequences so that new rows start from the correct ID
	const plotsMaxId = Math.max(...plots.map(p => p.id));
	const eventsMaxId = Math.max(...events.map(e => e.id));
	const messagesMaxId = Math.max(...messages.map(m => m.id));
	await knex.raw(`ALTER SEQUENCE story_plots_id_seq RESTART WITH ${plotsMaxId + 1}`)
	await knex.raw(`ALTER SEQUENCE story_events_id_seq RESTART WITH ${eventsMaxId + 1}`)
	await knex.raw(`ALTER SEQUENCE story_messages_id_seq RESTART WITH ${messagesMaxId + 1}`)
};
