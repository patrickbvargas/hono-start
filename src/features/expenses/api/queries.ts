import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import type { Option } from "@/shared/schemas/option";
import { assertCan, authMiddleware } from "@/shared/session";
import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { EXPENSE_ERRORS } from "../constants/errors";
import {
	getExpenseById,
	getExpenseCategories,
	getExpenses,
} from "../data/queries";
import { expenseIdInputSchema } from "../schemas/form";
import type { ExpenseDetail, ExpenseSummary } from "../schemas/model";
import { type ExpenseSearch, expenseSearchSchema } from "../schemas/search";

export const expenseKeys = {
	all: ["expense"] as const,
	list: (search: ExpenseSearch) => [...expenseKeys.all, search] as const,
	detail: (id: number) => [...expenseKeys.all, "detail", id] as const,
	categoryOptions: () => [...expenseKeys.all, "category-options"] as const,
};

const getExpensesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(expenseSearchSchema)
	.handler(
		async ({ data }): Promise<QueryPaginatedReturnType<ExpenseSummary>> => {
			try {
				const session = await getRequiredServerLoggedUserSession();
				const { firmId } = await getServerScope("expense");

				assertCan(session, "expense.view", { firmId });

				return await getExpenses({ firmId, search: data });
			} catch (error) {
				console.error("[getExpenses]", error);
				throw new Error(EXPENSE_ERRORS.GET_FAILED);
			}
		},
	);

const getExpenseByIdFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(expenseIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<ExpenseDetail>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("expense");

			assertCan(session, "expense.view", { firmId });

			return await getExpenseById({ firmId, id: data.id });
		} catch (error) {
			console.error("[getExpenseById]", error);
			if (hasExactErrorMessage(error, EXPENSE_ERRORS)) {
				throw error;
			}

			throw new Error(EXPENSE_ERRORS.DETAIL_FAILED);
		}
	});

const getExpenseCategoriesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("expense");

			assertCan(session, "expense.view", { firmId });

			return await getExpenseCategories();
		} catch (error) {
			console.error("[getExpenseCategories]", error);
			throw new Error(EXPENSE_ERRORS.CATEGORY_OPTIONS_FAILED);
		}
	});

export const getExpensesQueryOptions = (search: ExpenseSearch) =>
	queryOptions({
		queryKey: expenseKeys.list(search),
		queryFn: () => getExpensesFn({ data: search }),
	});

export const getExpenseByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: expenseKeys.detail(id),
		queryFn: () => getExpenseByIdFn({ data: { id } }),
	});

export const getExpenseCategoriesQueryOptions = () =>
	queryOptions({
		queryKey: expenseKeys.categoryOptions(),
		queryFn: getExpenseCategoriesFn,
	});
