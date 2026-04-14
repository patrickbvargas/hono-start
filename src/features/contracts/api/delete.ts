import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import { getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { contractIdInputSchema } from "../schemas/form";
import { assertCanAccessContractById } from "./resource";

const deleteContract = createServerFn({ method: "POST" })
	.inputValidator(contractIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const contract = await assertCanAccessContractById(
				session,
				"contract.delete",
				data.id,
			);

			if (contract.hasActiveRevenues) {
				throw new Error(
					"Não é possível excluir um contrato com receitas ativas",
				);
			}

			await prisma.contract.update({
				where: { id: data.id },
				data: { deletedAt: new Date() },
			});

			return { success: true };
		} catch (error) {
			console.error("[deleteContract]", error);
			if (
				error instanceof Error &&
				(error.message.includes("Contrato não encontrado") ||
					error.message.includes("receitas ativas") ||
					error.message.includes("administradores"))
			) {
				throw error;
			}
			throw new Error("Erro ao excluir contrato");
		}
	});

export const deleteContractOptions = () =>
	mutationOptions({
		mutationFn: deleteContract,
	});
