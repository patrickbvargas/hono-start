const ONLY_DIGITS_REGEX = /\D/g;

export function normalizeClientDocument(value: string) {
	return value.replace(ONLY_DIGITS_REGEX, "");
}

export function normalizeOptionalText(value?: string | null) {
	const normalized = value?.trim() ?? "";
	return normalized.length > 0 ? normalized : null;
}
