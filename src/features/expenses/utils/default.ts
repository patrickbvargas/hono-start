import type { ExpenseCreateInput, ExpenseUpdateInput } from "../schemas/form";
import type { ExpenseDetail } from "../schemas/model";
import type { ExpenseSearch } from "../schemas/search";

export const defaultExpenseCreateValues = (): ExpenseCreateInput => ({
	supplierId: "",
	negotiatedAmount: 0,
	notes: "",
	isActive: true,
});

export const defaultExpenseUpdateValues = (
	initialValue: ExpenseDetail,
): ExpenseUpdateInput => ({
	id: initialValue.id,
	supplierId: String(initialValue.supplierId),
	negotiatedAmount: initialValue.negotiatedAmount,
	notes: initialValue.notes ?? "",
	isActive: initialValue.isActive,
});

export const expenseSearchDefaults: ExpenseSearch = {
	page: 1,
	limit: 25,
	column: "createdAt",
	direction: "desc",
	query: "",
	supplierId: undefined,
	dateFrom: "",
	dateTo: "",
	active: "all",
	status: "active",
};
