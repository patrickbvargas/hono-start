import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { REMUNERATION_ERRORS } from "../constants/errors";
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
			if (hasExactErrorMessage(error, REMUNERATION_ERRORS)) {
				throw error;
			}

			throw new Error(REMUNERATION_ERRORS.REMUNERATION_DELETE_FAILED);
		}
	});

export const deleteRemunerationOptions = () =>
	mutationOptions({
		mutationFn: deleteRemuneration,
	});
