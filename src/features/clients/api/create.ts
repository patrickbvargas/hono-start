import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { clientCreateSchema } from "../schemas/form";
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
	.inputValidator(clientCreateSchema)
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
				(error.message.includes("Tipo de cliente") ||
					error.message.includes("CPF") ||
					error.message.includes("CNPJ") ||
					error.message.includes("documento"))
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
