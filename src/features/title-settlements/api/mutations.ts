import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasSafeMutationErrorMessage } from "@/shared/lib/error-mapping";
import { authMiddleware } from "@/shared/session/server";
import { SETTLEMENT_ERRORS } from "../constants/errors";
import { createSettlement, reverseSettlement } from "../data/mutations";
import {
	settlementCreateInputSchema,
	settlementReverseInputSchema,
} from "../schemas/form";

const createSettlementFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(settlementCreateInputSchema)
	.handler(async ({ context, data }) => {
		try {
			return await createSettlement(context.session, data);
		} catch (error) {
			console.error("[createSettlement]", error);
			if (hasSafeMutationErrorMessage(error, SETTLEMENT_ERRORS)) {
				throw error;
			}
			throw new Error(SETTLEMENT_ERRORS.FAILED);
		}
	});
const reverseSettlementFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(settlementReverseInputSchema)
	.handler(async ({ context, data }) => {
		try {
			return await reverseSettlement(context.session, data);
		} catch (error) {
			console.error("[reverseSettlement]", error);
			if (hasSafeMutationErrorMessage(error, SETTLEMENT_ERRORS)) {
				throw error;
			}
			throw new Error(SETTLEMENT_ERRORS.FAILED);
		}
	});
export const createSettlementMutationOptions = () =>
	mutationOptions({ mutationFn: createSettlementFn });
export const reverseSettlementMutationOptions = () =>
	mutationOptions({ mutationFn: reverseSettlementFn });
