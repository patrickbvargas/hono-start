import type { ClientType, PrismaClient } from "@/generated/prisma/client";

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
		throw new Error("Selecione um tipo de cliente ativo");
	}
}

export function validateImmutableClientType(
	selection: ClientTypeSelection,
	options: ClientTypeValidationOptions = {},
) {
	if (options.currentTypeId && selection.type.id !== options.currentTypeId) {
		throw new Error("O tipo do cliente não pode ser alterado");
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
		throw new Error("Tipo de cliente não encontrado");
	}

	return { type };
}
