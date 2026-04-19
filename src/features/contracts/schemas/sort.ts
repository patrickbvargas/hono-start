import type { z } from "zod";
import { createSortSchema } from "@/shared/schemas/sort";
import { CONTRACT_ALLOWED_SORT_COLUMNS } from "../constants/sorting";
import type { ContractSummary } from "./model";

export const contractSortSchema = createSortSchema<ContractSummary>({
	columns: CONTRACT_ALLOWED_SORT_COLUMNS,
	defaultColumn: "createdAt",
	defaultDirection: "desc",
});

export type ContractSort = z.infer<typeof contractSortSchema>;
