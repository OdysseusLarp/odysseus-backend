import { getPath } from "@/store/store";
import { SkillLevels, getHighestSkillLevel } from "./groups";
import { ScienceAnalysisTimes, Stores } from "@/store/types";
import { logger } from "@/logger";
import { Duration } from "./time";
import { ArtifactEntry, Artifact } from "@/models/artifact";
import Bookshelf from 'bookshelf';

const EVA_ID = '20263';

const SampleTypes = {
	BLOOD_SAMPLE: 'Blood sample',
	GENE_SAMPLE: 'Gene sample',
	MATERIAL_SAMPLE: 'Material sample',
	OTHER_SAMPLE: 'Other sample',
	MICROSCOPE_SAMPLE: 'Microscopic analysis',
	AGE: 'Radiocarbon dating',
	HISTORY_SAMPLE: 'Historical analysis',
	XRF_SAMPLE: 'X-Ray Fluorescence analysis',
} as const;

export const addOperationResultsToArtifactEntry = async (operationResult: Bookshelf.Model<unknown>) => {
	const operationType = operationResult.get('additional_type');
	const catalogId = operationResult.get('catalog_id');
	if (!catalogId) return;

	const artifact = await Artifact.forge().where({ catalog_id: catalogId }).fetchWithRelated();
	if (!artifact) return;

	let entryText: string | null;
	switch (operationType) {
		case 'MATERIAL_SAMPLE':
			entryText = artifact.get('test_material');
			break;
		case 'MICROSCOPE_SAMPLE':
			entryText = artifact.get('test_microscope');
			break;
		case 'AGE':
			entryText = artifact.get('test_age');
			break;
		case 'XRF_SAMPLE':
			entryText = artifact.get('test_xrf');
			break;
		case 'HISTORY_SAMPLE':
			entryText = artifact.get('test_history');
			break;
		default:
			entryText = null;
	}

	// TODO: Check from artifact.entries[].entry if the operation result is already added (contains entryText)
	// if it does, throw a specific error, and give a specific response to the user

	if (entryText) {
		entryText = `542 **${SampleTypes[operationType] ?? operationType} results:** ${entryText}`;
	} else {
		entryText = `542 **${SampleTypes[operationType] ?? operationType} results:** No significant findings were discovered.`;
	}

	const entry = new ArtifactEntry();
	await entry.save({
		artifact_id: artifact.get('id'),
		entry: entryText,
		person_id: EVA_ID
	});
	await operationResult.save({ is_complete: true }, { method: 'update', patch: true });
	logger.success(`Added #${operationResult.get("id")} ${operationType} results to artifact ${artifact.get('name')} (${artifact.get('catalog_id')})`);
};

export const getScienceAnalysisTime = (analysisAuthor: unknown): number => {
	const skillLevel = getHighestSkillLevel(analysisAuthor);
	const detectionTimesBlob = getPath(['data', 'misc', Stores.ScienceAnalysisTimes]);
	const detectionTimes = ScienceAnalysisTimes.safeParse(detectionTimesBlob);
	if (!detectionTimes.success) {
		logger.error('Failed to parse science analysis times blob, returning 20min', detectionTimesBlob);
		return Duration.minutes(20);
	}

	// TODO: Get data from blob once it's available
	const isA550PluggedIn = true;

	const addedTime = isA550PluggedIn ? 0 : detectionTimes.data.analysis_times.a550_time_reduction;

	switch (skillLevel) {
		case SkillLevels.Expert:
			return detectionTimes.data.analysis_times[SkillLevels.Expert] + addedTime;
		case SkillLevels.Master:
			return detectionTimes.data.analysis_times[SkillLevels.Master] + addedTime;
		case SkillLevels.Novice:
			return detectionTimes.data.analysis_times[SkillLevels.Novice]+ addedTime;
		default:
			return Duration.minutes(20);
	}
};
