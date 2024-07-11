import { getPath, store } from '@/store/store';
import { SkillLevels, getHighestSkillLevel } from './groups';
import { ScienceAnalysisTimes, Stores } from '@/store/types';
import { logger } from '@/logger';
import { Duration } from './time';
import { ArtifactEntry, Artifact } from '@/models/artifact';
import Bookshelf from 'bookshelf';
import { BigBatteryLocation, isBatteryConnectedAndCharged } from './bigbattery-helpers';

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
	XRF_SCAN: 'X-Ray Fluorescence analysis',
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
		case 'XRF_SCAN':
			entryText = artifact.get('test_xrf');
			break;
		case 'HISTORY_SAMPLE':
			entryText = artifact.get('test_history');
			break;
		case 'OTHER_SAMPLE':
			logger.info('Skipping submission of operation result, as it is of type OTHER_SAMPLE');
			return;
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
		person_id: EVA_ID,
	});
	await operationResult.save({ is_complete: true }, { method: 'update', patch: true });
	logger.success(
		`Added #${operationResult.get('id')} ${operationType} results to artifact ${artifact.get('name')} (${artifact.get('catalog_id')})`
	);
};

export const getScienceAnalysisTime = (analysisAuthor: unknown): number => {
	const skillLevel = getHighestSkillLevel(analysisAuthor);
	const detectionTimesBlob = getPath(['data', 'misc', Stores.ScienceAnalysisTimes]);
	const detectionTimes = ScienceAnalysisTimes.safeParse(detectionTimesBlob);
	if (!detectionTimes.success) {
		logger.error('Failed to parse science analysis times blob, returning 20min', detectionTimesBlob);
		return Duration.minutes(20);
	}

	const analysisTimes = detectionTimes.data.analysis_times;

	// Check if the big battery is connected to the science lab, add penalty if not
	const bigBatteryBox = store.getState().data.box.bigbattery;
	const hasBigBattery = isBatteryConnectedAndCharged(bigBatteryBox, BigBatteryLocation.SCIENCE);
	const penalty = hasBigBattery ? 0 : analysisTimes.batteryless_operation_penalty;

	switch (skillLevel) {
		case SkillLevels.Expert:
			return analysisTimes[SkillLevels.Expert] + penalty;
		case SkillLevels.Master:
			return analysisTimes[SkillLevels.Master] + penalty;
		case SkillLevels.Novice:
			return analysisTimes[SkillLevels.Novice] + penalty;
		default:
			return Duration.minutes(20);
	}
};
