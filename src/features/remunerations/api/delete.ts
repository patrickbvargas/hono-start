import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { remunerationIdInputSchema } from "../schemas/form";
import { assertCanAccessRemunerationById } from "./resource";

const deleteRemuneration = createServerFn({ method: "POST" })
	.inputValidator(remunerationIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			await assertCanAccessRemunerationById(
				session,
				"remuneration.delete",
				data.id,
			);

			await prisma.remuneration.update({
				where: { id: data.id },
				data: {
					deletedAt: new Date(),
				},
			});

			return { success: true };
		} catch (error) {
			console.error("[deleteRemuneration]", error);
			if (
				hasExactErrorMessage(error, [
					"Remuneração não encontrada",
					"Apenas administradores podem excluir remunerações",
				])
			) {
				throw error;
			}

			throw new Error("Erro ao excluir remuneração");
		}
	});

export const deleteRemunerationOptions = () =>
	mutationOptions({
		mutationFn: deleteRemuneration,
	});
