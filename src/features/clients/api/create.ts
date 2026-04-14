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
import { clientCreateInputSchema } from "../schemas/form";
import {
	normalizeClientDocument,
	normalizeOptionalText,
} from "../utils/normalization";
import { getClientDocumentValidationMessage } from "../utils/validation";
import {
	resolveClientTypeSelection,
	validateClientTypeSelection,
} from "./lookups";

const createClient = createServerFn({ method: "POST" })
	.inputValidator(clientCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "client.create");
			const { firmId } = getServerScope("client");
			const { type } = await resolveClientTypeSelection(prisma, data);
			validateClientTypeSelection({ type });

			const document = normalizeClientDocument(data.document);
			const documentError = getClientDocumentValidationMessage(
				type.value,
				document,
			);
			if (documentError) {
				throw new Error(documentError);
			}

			await prisma.client.create({
				data: {
					firmId,
					typeId: type.id,
					fullName: data.fullName.trim(),
					document,
					email: normalizeOptionalText(data.email),
					phone: normalizeOptionalText(data.phone),
					isActive: data.isActive,
				},
			});

			return { success: true };
		} catch (error) {
			console.error("[createClient]", error);
			if (isPrismaUniqueConstraintError(error, ["firmId", "document"])) {
				throw new Error("Este documento já está cadastrado");
			}

			if (
				hasExactErrorMessage(error, [
					"Você não tem permissão para criar clientes",
					"Tipo de cliente não encontrado",
					"Selecione um tipo de cliente ativo",
					"Documento é obrigatório",
					"CPF inválido",
					"CNPJ inválido",
					"Tipo de cliente inválido",
				])
			) {
				throw error;
			}
			throw new Error("Erro ao criar cliente");
		}
	});

export const createClientOptions = () =>
	mutationOptions({
		mutationFn: createClient,
	});
