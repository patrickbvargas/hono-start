export function normalizeOptionalText(value?: string | null) {
	const normalized = value?.trim();
	return normalized ? normalized : null;
}
