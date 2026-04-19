import type { z } from "zod";
import { createSortSchema } from "@/shared/schemas/sort";
import { REMUNERATION_ALLOWED_SORT_COLUMNS } from "../constants/sorting";
import type { Remuneration } from "./model";

export const remunerationSortSchema = createSortSchema<Remuneration>({
	columns: REMUNERATION_ALLOWED_SORT_COLUMNS,
	defaultColumn: "paymentDate",
	defaultDirection: "desc",
});

export type RemunerationSort = z.infer<typeof remunerationSortSchema>;
