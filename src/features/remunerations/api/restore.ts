import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { remunerationIdInputSchema } from "../schemas/form";
import { assertCanAccessRemunerationById } from "./resource";

const restoreRemuneration = createServerFn({ method: "POST" })
	.inputValidator(remunerationIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const remuneration = await assertCanAccessRemunerationById(
				session,
				"remuneration.restore",
				data.id,
			);

			if (remuneration.parentFeeIsSoftDeleted) {
				throw new Error(
					"Não é possível restaurar a remuneração enquanto o honorário de origem estiver excluído",
				);
			}

			await prisma.remuneration.update({
				where: { id: data.id },
				data: {
					deletedAt: null,
				},
			});

			return { success: true };
		} catch (error) {
			console.error("[restoreRemuneration]", error);
			if (
				hasExactErrorMessage(error, [
					"Remuneração não encontrada",
					"Apenas administradores podem restaurar remunerações",
					"Não é possível restaurar a remuneração enquanto o honorário de origem estiver excluído",
				])
			) {
				throw error;
			}

			throw new Error("Erro ao restaurar remuneração");
		}
	});

export const restoreRemunerationOptions = () =>
	mutationOptions({
		mutationFn: restoreRemuneration,
	});
