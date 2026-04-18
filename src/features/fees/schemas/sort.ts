import * as z from "zod";
import { FEE_ALLOWED_SORT_COLUMNS } from "../constants/sorting";

export const feeSortSchema = z.object({
	column: z
		.enum(FEE_ALLOWED_SORT_COLUMNS)
		.catch("paymentDate")
		.default("paymentDate"),
	direction: z.enum(["asc", "desc"]).catch("desc").default("desc"),
});

export type FeeSort = z.infer<typeof feeSortSchema>;
