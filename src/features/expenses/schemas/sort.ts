import type { z } from "zod";
import { createSortSchema } from "@/shared/schemas/sort";
import { EXPENSE_ALLOWED_SORT_COLUMNS } from "../constants/sorting";
import type { ExpenseSummary } from "./model";

export const expenseSortSchema = createSortSchema<ExpenseSummary>({
	columns: EXPENSE_ALLOWED_SORT_COLUMNS,
	defaultColumn: "expenseDate",
	defaultDirection: "desc",
});

export type ExpenseSort = z.infer<typeof expenseSortSchema>;
