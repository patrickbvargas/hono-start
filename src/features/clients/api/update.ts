import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { clientUpdateSchema } from "../schemas/form";
import {
	normalizeClientDocument,
	normalizeOptionalText,
} from "../utils/normalization";
import { getClientDocumentValidationMessage } from "../utils/validation";
import {
	resolveClientTypeSelection,
	validateClientTypeSelection,
	validateImmutableClientType,
} from "./lookups";

const updateClient = createServerFn({ method: "POST" })
	.inputValidator(clientUpdateSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "client.update");
			const { firmId } = getServerScope("client");
			const existing = await prisma.client.findFirst({
				where: { id: data.id, firmId },
			});

			if (!existing) {
				throw new Error("Cliente não encontrado");
			}

			const { type } = await resolveClientTypeSelection(prisma, data);
			validateClientTypeSelection({ type }, { currentTypeId: existing.typeId });
			validateImmutableClientType({ type }, { currentTypeId: existing.typeId });

			const document = normalizeClientDocument(data.document);
			const documentError = getClientDocumentValidationMessage(
				type.value,
				document,
			);
			if (documentError) {
				throw new Error(documentError);
			}

			await prisma.client.update({
				where: { id: data.id },
				data: {
					fullName: data.fullName.trim(),
					document,
					email: normalizeOptionalText(data.email),
					phone: normalizeOptionalText(data.phone),
					isActive: data.isActive,
				},
			});

			return { success: true };
		} catch (error) {
			console.error("[updateClient]", error);
			if (
				error instanceof Error &&
				error.message.includes("Unique constraint") &&
				error.message.includes("firmId") &&
				error.message.includes("document")
			) {
				throw new Error("Este documento já está cadastrado");
			}
			if (
				error instanceof Error &&
				(error.message === "Cliente não encontrado" ||
					error.message.includes("Tipo de cliente") ||
					error.message.includes("CPF") ||
					error.message.includes("CNPJ") ||
					error.message.includes("documento") ||
					error.message.includes("tipo"))
			) {
				throw error;
			}
			throw new Error("Erro ao atualizar cliente");
		}
	});

export const updateClientOptions = () =>
	mutationOptions({
		mutationFn: updateClient,
	});
