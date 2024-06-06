import { SkillLevels } from '@/utils/groups';
import { z } from 'zod';

export const Stores = {
	HackerDetectionTimes: 'hacker_detection_times',
	ScienceAnalysisTimes: 'science_analysis_times',
	ScienceAnalysisInProgress: 'science_analysis_in_progress',
	TagUidToArtifactCatalogId: 'tag_uid_to_artifact_catalog_id',
} as const;

export const HackerDetectionTimes = z.object({
	type: z.literal('misc'),
	id: z.literal(Stores.HackerDetectionTimes),
	detection_times: z.object({
		[SkillLevels.Novice]: z.number().min(0).int(),
		[SkillLevels.Master]: z.number().min(0).int(),
		[SkillLevels.Expert]: z.number().min(0).int(),
	}),
});
export type HackerDetectionTimes = z.infer<typeof HackerDetectionTimes>;

export const ScienceAnalysisTimes = z.object({
	type: z.literal('misc'),
	id: z.literal(Stores.ScienceAnalysisTimes),
	analysis_times: z.object({
		[SkillLevels.Novice]: z.number().min(0).int(),
		[SkillLevels.Master]: z.number().min(0).int(),
		[SkillLevels.Expert]: z.number().min(0).int(),
		batteryless_operation_penalty: z.number().int(),
	}),
});
export type ScienceAnalysisTimes = z.infer<typeof ScienceAnalysisTimes>;

const AnalysisInProgress = z.object({
	artifact_catalog_id: z.string(),
	author_name: z.string(),
	completes_at: z.number().int(),
	operation_additional_type: z.string(),
	operation_result_id: z.number().int().positive(),
	started_at: z.number().int(),
});

export const ScienceAnalysisInProgress = z.object({
	type: z.literal('misc'),
	id: z.literal(Stores.ScienceAnalysisInProgress),
	analysis_in_progress: z.array(AnalysisInProgress),
});
export type ScienceAnalysisInProgress = z.infer<typeof ScienceAnalysisInProgress>;
