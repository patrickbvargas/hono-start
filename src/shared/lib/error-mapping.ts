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

export function hasSafeMutationErrorMessage(
	error: unknown,
	messages: ErrorMessageCatalog,
) {
	return hasExactErrorMessage(error, [
		...Object.values(messages),
		"Você não tem permissão para esta operação.",
		"Conta sem colaborador vinculado para esta operação.",
	]);
}

export function isPrismaUniqueConstraintError(
	error: unknown,
	targetFields: readonly string[],
) {
	if (!isRecord(error) || error.code !== "P2002") {
		return false;
	}

	const meta = error.meta;
	const target = isRecord(meta) ? meta.target : undefined;
	if (Array.isArray(target)) {
		return targetFields.every((field) => target.includes(field));
	}

	const adapter = isRecord(meta) ? meta.driverAdapterError : undefined;
	const cause = isRecord(adapter) ? adapter.cause : undefined;
	const constraint = isRecord(cause) ? cause.constraint : undefined;
	const fields = isRecord(constraint) ? constraint.fields : undefined;
	if (Array.isArray(fields)) {
		return targetFields.every((field) => fields.includes(field));
	}
	const message = error instanceof Error ? error.message : "";
	const constraintName =
		typeof target === "string"
			? target
			: isRecord(constraint) && typeof constraint.index === "string"
				? constraint.index
				: message.match(
						/Unique constraint failed on the constraint: [`"]([^`"]+)[`"]/,
					)?.[1];
	const parts = constraintName?.split("_") ?? [];
	return (
		targetFields.length > 0 &&
		targetFields.every((field) => parts.includes(field))
	);
}
