import { createSortSchema } from "@/shared/schemas/sort";
import { RECEIVABLE_ALLOWED_SORT_COLUMNS } from "../constants/sorting";
import type { ReceivableSummary } from "./model";
export const receivableSortSchema = createSortSchema<ReceivableSummary>({
	columns: RECEIVABLE_ALLOWED_SORT_COLUMNS,
	defaultColumn: "dueDate",
	defaultDirection: "asc",
});
