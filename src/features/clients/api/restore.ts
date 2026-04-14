import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { clientIdInputSchema } from "../schemas/form";

const restoreClient = createServerFn({ method: "POST" })
	.inputValidator(clientIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "client.restore");
			const { firmId } = getServerScope("client");
			const existing = await prisma.client.findFirst({
				where: { id: data.id, firmId, NOT: { deletedAt: null } },
			});

			if (!existing) {
				throw new Error("Cliente não encontrado");
			}

			await prisma.client.update({
				where: { id: data.id },
				data: { deletedAt: null },
			});

			return { success: true };
		} catch (error) {
			console.error("[restoreClient]", error);
			if (
				error instanceof Error &&
				(error.message.includes("não encontrado") ||
					error.message.includes("administradores"))
			) {
				throw error;
			}
			throw new Error("Erro ao restaurar cliente");
		}
	});

export const restoreClientOptions = () =>
	mutationOptions({
		mutationFn: restoreClient,
	});
