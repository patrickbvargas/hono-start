import * as z from "zod";
import { paginationSchema } from "@/shared/schemas/pagination";
import { expenseFilterSchema } from "./filter";
import { expenseSortSchema } from "./sort";

export const expenseSearchSchema = z.object({
	...paginationSchema.shape,
	...expenseSortSchema.shape,
	...expenseFilterSchema.shape,
});

export type ExpenseSearch = z.infer<typeof expenseSearchSchema>;
