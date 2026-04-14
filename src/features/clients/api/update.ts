import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { clientUpdateInputSchema } from "../schemas/form";
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
	.inputValidator(clientUpdateInputSchema)
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
			if (isPrismaUniqueConstraintError(error, ["firmId", "document"])) {
				throw new Error("Este documento já está cadastrado");
			}

			if (
				hasExactErrorMessage(error, [
					"Você não tem permissão para editar clientes",
					"Cliente não encontrado",
					"Tipo de cliente não encontrado",
					"Selecione um tipo de cliente ativo",
					"O tipo do cliente não pode ser alterado",
					"Documento é obrigatório",
					"CPF inválido",
					"CNPJ inválido",
					"Tipo de cliente inválido",
				])
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
