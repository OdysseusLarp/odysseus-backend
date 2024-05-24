import { getPath } from '@/store/store';
import { SkillLevels, getHighestSkillLevel } from './groups';
import { Duration } from './time';
import { HackerDetectionTimes, Stores } from '@/store/types';
import { logger } from '@/logger';

const hackingIntrustionDetectionMessages = [
	'Intrusion detection system has detected malicious activity',
	'System has detected unusual network patterns',
	'Unusual activity recognized within the system',
	'System analysis reveals potential illicit entry',
	'Inconsistent data patterns suggest possible intrusion',
	'System surveillance notes suspicious activity',
	'Potential intrusion detected by the system\'s defense mechanism',
	'Cyber defense system has detected irregular activity',
	'Unusual system access patterns detected',
	'Abnormal network behavior suggests possible intrusion',
	'Inconsistent network patterns hinting at potential breach',
	'System reports unusual activity, possible intrusion',
	'System has detected a potential security breach',
	'System\'s defense mechanism notes potential intrusion',
	'System analysis records irregular access patterns',
	'Network surveillance system detects potential malicious activity',
];

export const getRandomHackingIntrustionDetectionMessage = () => {
	const randomIndex = Math.floor(Math.random() * hackingIntrustionDetectionMessages.length);
	return hackingIntrustionDetectionMessages[randomIndex];
};

export const getHackingDetectionTime = (hackerPerson: unknown): number => {
	const skillLevel = getHighestSkillLevel(hackerPerson);
	const detectionTimesBlob = getPath(['data', 'misc', Stores.HackerDetectionTimes]);
	const detectionTimes = HackerDetectionTimes.safeParse(detectionTimesBlob);
	if (!detectionTimes.success) {
		logger.error('Failed to parse detection times blob, returning 1min', detectionTimesBlob);
		return Duration.minutes(1);
	}

	switch (skillLevel) {
		case SkillLevels.Expert:
			return detectionTimes.data.detection_times[SkillLevels.Expert];
		case SkillLevels.Master:
			return detectionTimes.data.detection_times[SkillLevels.Master];
		case SkillLevels.Novice:
			return detectionTimes.data.detection_times[SkillLevels.Novice];
		default:
			return Duration.minutes(1);
	}
};
