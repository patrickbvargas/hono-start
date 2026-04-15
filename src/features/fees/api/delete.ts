import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { FEE_ERRORS } from "../constants/errors";
import { feeIdInputSchema } from "../schemas/form";
import { assertCanAccessFeeById } from "./resource";
import { syncContractStatusFromFees, syncFeeDeleteState } from "./write";

const deleteFee = createServerFn({ method: "POST" })
	.inputValidator(feeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const fee = await assertCanAccessFeeById(session, "fee.delete", data.id);
			const deletedAt = new Date();

			await prisma.$transaction(async (tx) => {
				await tx.fee.update({
					where: { id: data.id },
					data: { deletedAt },
				});

				await syncFeeDeleteState(tx, data.id, deletedAt);
				await syncContractStatusFromFees(tx, fee.contractId);
			});

			return { success: true };
		} catch (error) {
			console.error("[deleteFee]", error);
			if (hasExactErrorMessage(error, FEE_ERRORS)) {
				throw error;
			}

			throw new Error(FEE_ERRORS.FEE_DELETE_FAILED);
		}
	});

export const deleteFeeOptions = () =>
	mutationOptions({
		mutationFn: deleteFee,
	});
