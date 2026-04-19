import type { z } from "zod";
import { createSortSchema } from "@/shared/schemas/sort";
import { FEE_ALLOWED_SORT_COLUMNS } from "../constants/sorting";
import type { FeeSummary } from "./model";

export const feeSortSchema = createSortSchema<FeeSummary>({
	columns: FEE_ALLOWED_SORT_COLUMNS,
	defaultColumn: "paymentDate",
	defaultDirection: "desc",
});

export type FeeSort = z.infer<typeof feeSortSchema>;
