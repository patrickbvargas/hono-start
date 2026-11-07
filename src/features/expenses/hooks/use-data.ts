import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getExpenseByIdQueryOptions,
	getExpenseFinancialQueryOptions,
	getExpenseSuppliersQueryOptions,
	getExpensesQueryOptions,
} from "../api/queries";
import type { ExpenseSearch } from "../schemas/search";

export function useExpenses(search: ExpenseSearch) {
	const { data: expenses } = useSuspenseQuery(getExpensesQueryOptions(search));

	return { expenses };
}

export function useExpense(id: EntityId) {
	const { data: expense } = useSuspenseQuery(getExpenseByIdQueryOptions(id));

	return { expense };
}

export function useExpenseFinancial(id: EntityId) {
	const { data: financial } = useSuspenseQuery(
		getExpenseFinancialQueryOptions(id),
	);
	return { financial };
}

export function useExpenseOptions() {
	const [{ data: suppliers }] = useSuspenseQueries({
		queries: [getExpenseSuppliersQueryOptions()],
	});

	return { suppliers, categories: suppliers };
}
