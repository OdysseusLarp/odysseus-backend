import { SkillLevels } from '@/utils/groups';
import { z } from 'zod';

export const Stores = {
	HackerDetectionTimes: 'hacker_detection_times',
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
