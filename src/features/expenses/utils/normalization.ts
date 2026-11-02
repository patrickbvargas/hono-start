export function normalizeExpenseNotes(value: string | null | undefined) {
	return value?.trim() || null;
}
