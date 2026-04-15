import type { ClientType, PrismaClient } from "@/generated/prisma/client";
import { CLIENT_ERRORS } from "../constants/errors";

interface ClientTypeSelection {
	type: ClientType;
}

interface ClientTypeSelectionInput {
	type: string;
}

interface ClientTypeValidationOptions {
	currentTypeId?: number;
}

export function validateClientTypeSelection(
	selection: ClientTypeSelection,
	options: ClientTypeValidationOptions = {},
) {
	if (!selection.type.isActive && selection.type.id !== options.currentTypeId) {
		throw new Error(CLIENT_ERRORS.CLIENT_TYPE_INACTIVE);
	}
}

export function validateImmutableClientType(
	selection: ClientTypeSelection,
	options: ClientTypeValidationOptions = {},
) {
	if (options.currentTypeId && selection.type.id !== options.currentTypeId) {
		throw new Error(CLIENT_ERRORS.CLIENT_TYPE_NOT_MUTABLE);
	}
}

export async function resolveClientTypeSelection(
	prisma: PrismaClient,
	input: ClientTypeSelectionInput,
) {
	const type = await prisma.clientType.findUnique({
		where: { value: input.type },
	});

	if (!type) {
		throw new Error(CLIENT_ERRORS.CLIENT_TYPE_NOT_FOUND);
	}

	return { type };
}
