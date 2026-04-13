import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import { assertCan, getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { contractByIdSchema } from "../schemas/form";
import { getContractAccessResourceById } from "./resource";

const restoreContract = createServerFn({ method: "POST" })
	.inputValidator(contractByIdSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const contract = await getContractAccessResourceById(data.id);

			if (!contract) {
				throw new Error("Contrato não encontrado");
			}

			if (!contract.resource) {
				throw new Error("Contrato não encontrado");
			}

			assertCan(session, "contract.restore", contract.resource);

			const existing = await prisma.contract.findFirst({
				where: {
					id: data.id,
					firmId: contract.resource.firmId,
					NOT: { deletedAt: null },
				},
				select: { id: true },
			});

			if (!existing) {
				throw new Error("Contrato não encontrado");
			}

			await prisma.contract.update({
				where: { id: data.id },
				data: { deletedAt: null },
			});

			return { success: true };
		} catch (error) {
			console.error("[restoreContract]", error);
			if (
				error instanceof Error &&
				(error.message.includes("Contrato não encontrado") ||
					error.message.includes("administradores"))
			) {
				throw error;
			}
			throw new Error("Erro ao restaurar contrato");
		}
	});

export const restoreContractOptions = () =>
	mutationOptions({
		mutationFn: restoreContract,
	});
