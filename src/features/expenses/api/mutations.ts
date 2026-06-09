import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { assertCan, authMiddleware } from "@/shared/session";
import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type { MutationReturnType } from "@/shared/types/api";
import { EXPENSE_ERRORS } from "../constants/errors";
import {
	createExpense,
	deleteExpense,
	restoreExpense,
	updateExpense,
} from "../data/mutations";
import { getExpenseAccessResourceById } from "../data/queries";
import {
	expenseCreateInputSchema,
	expenseIdInputSchema,
	expenseUpdateInputSchema,
} from "../schemas/form";

const createExpenseFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(expenseCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("expense");

			assertCan(session, "expense.create", { firmId });

			return await createExpense({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				input: data,
			});
		} catch (error) {
			console.error("[createExpense]", error);
			if (hasExactErrorMessage(error, EXPENSE_ERRORS)) {
				throw error;
			}

			throw new Error(EXPENSE_ERRORS.CREATE_FAILED);
		}
	});

const updateExpenseFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(expenseUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("expense");
			const access = await getExpenseAccessResourceById(firmId, data.id);

			if (!access) {
				throw new Error(EXPENSE_ERRORS.DETAIL_NOT_FOUND);
			}

			assertCan(session, "expense.update", access.resource);

			return await updateExpense({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				input: data,
			});
		} catch (error) {
			console.error("[updateExpense]", error);
			if (hasExactErrorMessage(error, EXPENSE_ERRORS)) {
				throw error;
			}

			throw new Error(EXPENSE_ERRORS.UPDATE_FAILED);
		}
	});

const deleteExpenseFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(expenseIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("expense");
			const access = await getExpenseAccessResourceById(firmId, data.id);

			if (!access) {
				throw new Error(EXPENSE_ERRORS.DETAIL_NOT_FOUND);
			}

			assertCan(session, "expense.delete", access.resource);

			return await deleteExpense({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
			});
		} catch (error) {
			console.error("[deleteExpense]", error);
			if (hasExactErrorMessage(error, EXPENSE_ERRORS)) {
				throw error;
			}

			throw new Error(EXPENSE_ERRORS.DELETE_FAILED);
		}
	});

const restoreExpenseFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(expenseIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("expense");
			const access = await getExpenseAccessResourceById(firmId, data.id);

			if (!access) {
				throw new Error(EXPENSE_ERRORS.DETAIL_NOT_FOUND);
			}

			assertCan(session, "expense.restore", access.resource);

			return await restoreExpense({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
			});
		} catch (error) {
			console.error("[restoreExpense]", error);
			if (hasExactErrorMessage(error, EXPENSE_ERRORS)) {
				throw error;
			}

			throw new Error(EXPENSE_ERRORS.RESTORE_FAILED);
		}
	});

export const createExpenseMutationOptions = () =>
	mutationOptions({ mutationFn: createExpenseFn });

export const updateExpenseMutationOptions = () =>
	mutationOptions({ mutationFn: updateExpenseFn });

export const deleteExpenseMutationOptions = () =>
	mutationOptions({ mutationFn: deleteExpenseFn });

export const restoreExpenseMutationOptions = () =>
	mutationOptions({ mutationFn: restoreExpenseFn });
