import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { feeIdInputSchema } from "../schemas/form";
import { assertCanAccessFeeById } from "./resource";
import { syncContractStatusFromFees, syncFeeDeleteState } from "./write";

const restoreFee = createServerFn({ method: "POST" })
	.inputValidator(feeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const fee = await assertCanAccessFeeById(session, "fee.restore", data.id);

			await prisma.$transaction(async (tx) => {
				await tx.fee.update({
					where: { id: data.id },
					data: { deletedAt: null },
				});

				await syncFeeDeleteState(tx, data.id, null);
				await syncContractStatusFromFees(tx, fee.contractId);
			});

			return { success: true };
		} catch (error) {
			console.error("[restoreFee]", error);
			if (
				hasExactErrorMessage(error, [
					"Honorário não encontrado",
					"Apenas administradores podem restaurar honorários",
				])
			) {
				throw error;
			}

			throw new Error("Erro ao restaurar honorário");
		}
	});

export const restoreFeeOptions = () =>
	mutationOptions({
		mutationFn: restoreFee,
	});
