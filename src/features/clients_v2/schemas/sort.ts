import type { z } from "zod";
import { createSortSchema } from "@/shared/schemas/sort";
import { CLIENT_ALLOWED_SORT_COLUMNS } from "../constants/sorting";
import type { Client } from "./model";

export const clientSortSchema = createSortSchema<Client>({
	columns: CLIENT_ALLOWED_SORT_COLUMNS,
	defaultColumn: "fullName",
});

export type ClientSort = z.infer<typeof clientSortSchema>;
