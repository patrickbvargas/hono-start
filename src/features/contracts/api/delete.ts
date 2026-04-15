import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { CONTRACT_ERRORS } from "../constants/errors";
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
				throw new Error(CONTRACT_ERRORS.CONTRACT_HAS_ACTIVE_REVENUES);
			}

			await prisma.contract.update({
				where: { id: data.id },
				data: { deletedAt: new Date() },
			});

			return { success: true };
		} catch (error) {
			console.error("[deleteContract]", error);
			if (hasExactErrorMessage(error, CONTRACT_ERRORS)) {
				throw error;
			}
			throw new Error(CONTRACT_ERRORS.CONTRACT_DELETE_FAILED);
		}
	});

export const deleteContractOptions = () =>
	mutationOptions({
		mutationFn: deleteContract,
	});
