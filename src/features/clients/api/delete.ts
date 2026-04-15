import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { CLIENT_ERRORS } from "../constants/errors";
import { clientIdInputSchema } from "../schemas/form";
import { assertClientHasNoActiveContracts } from "./contracts";

const deleteClient = createServerFn({ method: "POST" })
	.inputValidator(clientIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "client.delete");
			const { firmId } = getServerScope("client");
			const existing = await prisma.client.findFirst({
				where: { id: data.id, firmId, deletedAt: null },
			});

			if (!existing) {
				throw new Error(CLIENT_ERRORS.CLIENT_NOT_FOUND);
			}

			await assertClientHasNoActiveContracts(data.id);

			await prisma.client.update({
				where: { id: data.id },
				data: { deletedAt: new Date() },
			});

			return { success: true };
		} catch (error) {
			console.error("[deleteClient]", error);
			if (hasExactErrorMessage(error, CLIENT_ERRORS)) {
				throw error;
			}
			throw new Error(CLIENT_ERRORS.CLIENT_DELETE_FAILED);
		}
	});

export const deleteClientOptions = () =>
	mutationOptions({
		mutationFn: deleteClient,
	});
