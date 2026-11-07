import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasSafeMutationErrorMessage } from "@/shared/lib/error-mapping";
import { authMiddleware } from "@/shared/session/server";
import type { MutationReturnType } from "@/shared/types/api";
import { FINANCIAL_TITLE_ERRORS } from "../constants/errors";
import {
	createDirectPayable,
	createDirectReceivable,
	generatePayablesFromExpense,
	generateReceivablesFromRevenue,
} from "../data/mutations";
import {
	directPayableCreateInputSchema,
	directReceivableCreateInputSchema,
	expensePayableGenerationInputSchema,
	revenueReceivableGenerationInputSchema,
} from "../schemas/form";

const generateReceivablesFromRevenueFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(revenueReceivableGenerationInputSchema)
	.handler(async ({ data, context }): Promise<MutationReturnType> => {
		try {
			return await generateReceivablesFromRevenue({
				session: context.session,
				input: data,
			});
		} catch (error) {
			console.error("[generateReceivablesFromRevenue]", error);
			if (hasSafeMutationErrorMessage(error, FINANCIAL_TITLE_ERRORS)) {
				throw error;
			}
			throw new Error(FINANCIAL_TITLE_ERRORS.GENERATE_FAILED);
		}
	});

const generatePayablesFromExpenseFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(expensePayableGenerationInputSchema)
	.handler(async ({ data, context }): Promise<MutationReturnType> => {
		try {
			return await generatePayablesFromExpense({
				session: context.session,
				input: data,
			});
		} catch (error) {
			console.error("[generatePayablesFromExpense]", error);
			if (hasSafeMutationErrorMessage(error, FINANCIAL_TITLE_ERRORS)) {
				throw error;
			}
			throw new Error(FINANCIAL_TITLE_ERRORS.GENERATE_FAILED);
		}
	});

const createDirectReceivableFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(directReceivableCreateInputSchema)
	.handler(async ({ data, context }): Promise<MutationReturnType> => {
		try {
			return await createDirectReceivable({
				session: context.session,
				input: data,
			});
		} catch (error) {
			console.error("[createDirectReceivable]", error);
			if (hasSafeMutationErrorMessage(error, FINANCIAL_TITLE_ERRORS)) {
				throw error;
			}
			throw new Error(FINANCIAL_TITLE_ERRORS.CREATE_FAILED);
		}
	});

const createDirectPayableFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(directPayableCreateInputSchema)
	.handler(async ({ data, context }): Promise<MutationReturnType> => {
		try {
			return await createDirectPayable({
				session: context.session,
				input: data,
			});
		} catch (error) {
			console.error("[createDirectPayable]", error);
			if (hasSafeMutationErrorMessage(error, FINANCIAL_TITLE_ERRORS)) {
				throw error;
			}
			throw new Error(FINANCIAL_TITLE_ERRORS.CREATE_FAILED);
		}
	});

export const generateReceivablesFromRevenueMutationOptions = () =>
	mutationOptions({ mutationFn: generateReceivablesFromRevenueFn });
export const generatePayablesFromExpenseMutationOptions = () =>
	mutationOptions({ mutationFn: generatePayablesFromExpenseFn });
export const createDirectReceivableMutationOptions = () =>
	mutationOptions({ mutationFn: createDirectReceivableFn });
export const createDirectPayableMutationOptions = () =>
	mutationOptions({ mutationFn: createDirectPayableFn });
