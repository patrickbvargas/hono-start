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
import { clientUpdateInputSchema } from "../schemas/form";
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
				throw new Error(CLIENT_ERRORS.CLIENT_NOT_FOUND);
			}

			const { type } = await resolveClientTypeSelection(prisma, data);
			validateClientTypeSelection({ type }, { currentTypeId: existing.typeId });
			validateImmutableClientType({ type }, { currentTypeId: existing.typeId });

			await prisma.client.update({
				where: { id: data.id },
				data: {
					fullName: data.fullName,
					document: data.document,
					email: data.email,
					phone: data.phone,
					isActive: data.isActive,
				},
			});

			return { success: true };
		} catch (error) {
			console.error("[updateClient]", error);
			if (isPrismaUniqueConstraintError(error, ["firmId", "document"])) {
				throw new Error(CLIENT_ERRORS.CLIENT_DOCUMENT_DUPLICATE);
			}

			if (hasExactErrorMessage(error, CLIENT_ERRORS)) {
				throw error;
			}
			throw new Error(CLIENT_ERRORS.CLIENT_UPDATE_FAILED);
		}
	});

export const updateClientOptions = () =>
	mutationOptions({
		mutationFn: updateClient,
	});
