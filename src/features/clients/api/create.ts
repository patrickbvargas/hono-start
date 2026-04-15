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
import { CLIENT_ERRORS } from "../constants/errors";
import { clientCreateInputSchema } from "../schemas/form";
import {
	normalizeClientDocument,
	normalizeOptionalText,
} from "../utils/normalization";
import { validateClientDocumentBusinessRules } from "../utils/validation";
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
			const documentIssues = validateClientDocumentBusinessRules({
				type: type.value,
				document,
			});
			if (documentIssues.length > 0) {
				throw new Error(documentIssues[0].message);
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
				throw new Error(CLIENT_ERRORS.CLIENT_DOCUMENT_DUPLICATE);
			}

			if (hasExactErrorMessage(error, CLIENT_ERRORS)) {
				throw error;
			}
			throw new Error(CLIENT_ERRORS.CLIENT_CREATE_FAILED);
		}
	});

export const createClientOptions = () =>
	mutationOptions({
		mutationFn: createClient,
	});
