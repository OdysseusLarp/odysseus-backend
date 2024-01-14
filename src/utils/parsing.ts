export const trimmedStringOrNull = (value: unknown): string | null => {
	if (typeof value === 'string' && value.trim()) {
		return value.trim();
	}
	return null;
}

export const parsedIntOrNull = (value: unknown): number | null => {
	if (typeof value === 'string' && value.trim()) {
		return parseInt(value.trim(), 10);
	}
	return null;
};

export const parsedBoolean = (value: unknown): boolean => {
	if (typeof value === 'string') {
		return value.trim().toUpperCase() === 'TRUE';
	}
	return false;
}

export const parseCommaSeparatedString = (value: unknown): string[] => {
	if (typeof value === 'string' && value.trim()) {
		return value.split(',').map(v => v.trim());
	}
	return [];
}
