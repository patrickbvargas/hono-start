function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function hasExactErrorMessage(
	error: unknown,
	messages: readonly string[],
) {
	return error instanceof Error && messages.includes(error.message);
}

export function isPrismaUniqueConstraintError(
	error: unknown,
	targetFields: readonly string[],
) {
	if (!isRecord(error) || error.code !== "P2002") {
		return false;
	}

	const meta = error.meta;
	if (!isRecord(meta)) {
		return false;
	}

	const target = meta.target;
	return (
		Array.isArray(target) &&
		targetFields.every((field) => target.includes(field))
	);
}
