function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export type ErrorMessageCatalog = Record<string, string>;

export function getErrorMessages(
	messages: readonly string[] | ErrorMessageCatalog,
) {
	return Array.isArray(messages) ? messages : Object.values(messages);
}

export function hasExactErrorMessage(
	error: unknown,
	messages: readonly string[] | ErrorMessageCatalog,
) {
	return (
		error instanceof Error && getErrorMessages(messages).includes(error.message)
	);
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
