import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { REMUNERATION_ERRORS } from "../constants/errors";
import { remunerationUpdateInputSchema } from "../schemas/form";
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
				throw new Error(REMUNERATION_ERRORS.REMUNERATION_EDIT_DELETED);
			}

			if (remuneration.parentFeeIsSoftDeleted) {
				throw new Error(REMUNERATION_ERRORS.REMUNERATION_EDIT_PARENT_DELETED);
			}

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
			if (hasExactErrorMessage(error, REMUNERATION_ERRORS)) {
				throw error;
			}

			throw new Error(REMUNERATION_ERRORS.REMUNERATION_UPDATE_FAILED);
		}
	});

export const updateRemunerationOptions = () =>
	mutationOptions({
		mutationFn: updateRemuneration,
	});
