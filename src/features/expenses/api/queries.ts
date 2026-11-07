import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import type { Option } from "@/shared/schemas/option";
import { assertCan } from "@/shared/session";
import {
	authMiddleware,
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type {
	FinancialQueryPaginatedReturnType,
	QueryManyReturnType,
	QueryOneReturnType,
} from "@/shared/types/api";
import { EXPENSE_ERRORS } from "../constants/errors";
import {
	getExpenseById,
	getExpenseFinancial,
	getExpenseSuppliers,
	getExpenses,
} from "../data/queries";
import { expenseIdInputSchema } from "../schemas/form";
import type {
	ExpenseDetail,
	ExpenseFinancial,
	ExpenseSummary,
} from "../schemas/model";
import { type ExpenseSearch, expenseSearchSchema } from "../schemas/search";

export const expenseKeys = {
	all: ["expense"] as const,
	list: (search: ExpenseSearch) => [...expenseKeys.all, search] as const,
	detail: (id: number) => [...expenseKeys.all, "detail", id] as const,
	financial: (id: number) => [...expenseKeys.all, "financial", id] as const,
	supplierOptions: () => [...expenseKeys.all, "supplier-options"] as const,
	categoryOptions: () => [...expenseKeys.all, "supplier-options"] as const,
};

const getExpensesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(expenseSearchSchema)
	.handler(
		async ({
			data,
		}): Promise<FinancialQueryPaginatedReturnType<ExpenseSummary>> => {
			try {
				const session = await getRequiredServerLoggedUserSession();
				const { firmId } = await getServerScope("expense");

				assertCan(session, "org:expenses:read", { firmId });

				return await getExpenses({ firmId, search: data });
			} catch (error) {
				console.error("[getExpenses]", error);
				throw new Error(EXPENSE_ERRORS.GET_FAILED);
			}
		},
	);

const getExpenseByIdFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(expenseIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<ExpenseDetail>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("expense");

			assertCan(session, "org:expenses:read", { firmId });

			return await getExpenseById({ firmId, id: data.id });
		} catch (error) {
			console.error("[getExpenseById]", error);
			if (hasExactErrorMessage(error, EXPENSE_ERRORS)) {
				throw error;
			}

			throw new Error(EXPENSE_ERRORS.DETAIL_FAILED);
		}
	});

const getExpenseSuppliersFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("expense");

			assertCan(session, "org:expenses:read", { firmId });

			return await getExpenseSuppliers();
		} catch (error) {
			console.error("[getExpenseSuppliers]", error);
			throw new Error(EXPENSE_ERRORS.SUPPLIER_OPTIONS_FAILED);
		}
	});

const getExpenseFinancialFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(expenseIdInputSchema)
	.handler(async ({ data, context }): Promise<ExpenseFinancial> => {
		const session = context.session;
		const firmId = session.firm.id;
		assertCan(session, "org:expenses:read", { firmId });
		assertCan(session, "org:payables:read_all", { firmId });
		try {
			return await getExpenseFinancial({ firmId, id: data.id });
		} catch (error) {
			console.error("[getExpenseFinancial]", error);
			if (hasExactErrorMessage(error, EXPENSE_ERRORS)) {
				throw error;
			}
			throw new Error(EXPENSE_ERRORS.FINANCIAL_FAILED);
		}
	});

export const getExpenseFinancialQueryOptions = (id: number) =>
	queryOptions({
		queryKey: expenseKeys.financial(id),
		queryFn: () => getExpenseFinancialFn({ data: { id } }),
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

export const getExpenseSuppliersQueryOptions = () =>
	queryOptions({
		staleTime: Infinity,
		meta: { refreshOnMutation: true },
		queryKey: expenseKeys.supplierOptions(),
		queryFn: getExpenseSuppliersFn,
	});

export const getExpenseCategoriesQueryOptions = getExpenseSuppliersQueryOptions;
