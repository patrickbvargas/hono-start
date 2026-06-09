import type { ExpenseCreateInput, ExpenseUpdateInput } from "../schemas/form";
import type { ExpenseDetail } from "../schemas/model";
import type { ExpenseSearch } from "../schemas/search";

export const defaultExpenseCreateValues = (): ExpenseCreateInput => ({
	category: "",
	expenseDate: "",
	amount: 0,
	notes: "",
	isActive: true,
});

export const defaultExpenseUpdateValues = (
	initialValue: ExpenseDetail,
): ExpenseUpdateInput => ({
	id: initialValue.id,
	category: initialValue.categoryValue,
	expenseDate: initialValue.expenseDate.slice(0, 10),
	amount: initialValue.amount,
	notes: initialValue.notes ?? "",
	isActive: initialValue.isActive,
});

export const expenseSearchDefaults: ExpenseSearch = {
	page: 1,
	limit: 25,
	column: "expenseDate",
	direction: "desc",
	query: "",
	category: "",
	dateFrom: "",
	dateTo: "",
	active: "all",
	status: "active",
};
