import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getExpenseByIdQueryOptions,
	getExpenseCategoriesQueryOptions,
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

export function useExpenseOptions() {
	const [{ data: categories }] = useSuspenseQueries({
		queries: [getExpenseCategoriesQueryOptions()],
	});

	return { categories };
}
