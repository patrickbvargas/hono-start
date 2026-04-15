import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { REMUNERATION_ERRORS } from "../constants/errors";
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
					REMUNERATION_ERRORS.REMUNERATION_RESTORE_PARENT_DELETED,
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
			if (hasExactErrorMessage(error, REMUNERATION_ERRORS)) {
				throw error;
			}

			throw new Error(REMUNERATION_ERRORS.REMUNERATION_RESTORE_FAILED);
		}
	});

export const restoreRemunerationOptions = () =>
	mutationOptions({
		mutationFn: restoreRemuneration,
	});
