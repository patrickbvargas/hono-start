import { createSortSchema } from "@/shared/schemas/sort";
import { PAYABLE_ALLOWED_SORT_COLUMNS } from "../constants/sorting";
import type { PayableSummary } from "./model";
export const payableSortSchema = createSortSchema<PayableSummary>({
	columns: PAYABLE_ALLOWED_SORT_COLUMNS,
	defaultColumn: "dueDate",
	defaultDirection: "asc",
});
