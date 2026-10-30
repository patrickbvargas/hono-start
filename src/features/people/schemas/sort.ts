import type { z } from "zod";
import { createSortSchema } from "@/shared/schemas/sort";
import { PERSON_ALLOWED_SORT_COLUMNS } from "../constants/sorting";
import type { PersonSummary } from "./model";

export const personSortSchema = createSortSchema<PersonSummary>({
	columns: PERSON_ALLOWED_SORT_COLUMNS,
	defaultColumn: "fullName",
});

export type PersonSort = z.infer<typeof personSortSchema>;
