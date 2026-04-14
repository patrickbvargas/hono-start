import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import { getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { remunerationUpdateInputSchema } from "../schemas/form";
import {
	assertRemunerationAmountPositive,
	assertRemunerationEffectivePercentage,
} from "../utils/validation";
import { assertCanAccessRemunerationById } from "./resource";

const updateRemuneration = createServerFn({ method: "POST" })
	.inputValidator(remunerationUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const remuneration = await assertCanAccessRemunerationById(
				session,
				"remuneration.update",
				data.id,
			);

			if (remuneration.deletedAt) {
				throw new Error("Não é possível editar uma remuneração excluída");
			}

			if (remuneration.parentFeeIsSoftDeleted) {
				throw new Error(
					"Não é possível editar uma remuneração vinculada a um honorário excluído",
				);
			}

			assertRemunerationAmountPositive(data.amount);
			assertRemunerationEffectivePercentage(data.effectivePercentage);

			await prisma.remuneration.update({
				where: { id: data.id },
				data: {
					amount: data.amount,
					effectivePercentage: data.effectivePercentage,
					isSystemGenerated: false,
				},
			});

			return { success: true };
		} catch (error) {
			console.error("[updateRemuneration]", error);
			if (
				error instanceof Error &&
				(error.message.includes("Remuneração") ||
					error.message.includes("remuneração") ||
					error.message.includes("honorário") ||
					error.message.includes("Percentual") ||
					error.message.includes("Valor"))
			) {
				throw error;
			}

			throw new Error("Erro ao atualizar remuneração");
		}
	});

export const updateRemunerationOptions = () =>
	mutationOptions({
		mutationFn: updateRemuneration,
	});
