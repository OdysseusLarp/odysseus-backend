export const SkillLevels = {
	Novice: 'skill:novice',
	Master: 'skill:master',
	Expert: 'skill:expert',
} as const;
export type SkillLevel = typeof SkillLevels[keyof typeof SkillLevels];

export function getHighestSkillLevel(person: unknown): SkillLevel {
	if (typeof person !== 'object' || person === null) {
		return SkillLevels.Novice;
	}

	// Dumb hack to work around Bookshelf models returning relations in a dumb way
	const { groups }: { groups: string[] } = JSON.parse(JSON.stringify(person));

	if (!Array.isArray(groups)) {
		return SkillLevels.Novice;
	}
	const skillLevels = groups.filter((group: string) => typeof group === 'string' && group.startsWith('skill:'));
	if (skillLevels.length === 0) {
		return SkillLevels.Novice;
	}

	if (skillLevels.includes(SkillLevels.Expert)) return SkillLevels.Expert;
	if (skillLevels.includes(SkillLevels.Master)) return SkillLevels.Master;
	return SkillLevels.Novice;
}
