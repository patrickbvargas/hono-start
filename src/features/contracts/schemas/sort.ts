import * as z from "zod";
import { CONTRACT_ALLOWED_SORT_COLUMNS } from "../constants";
export const contractSortSchema = z.object({
	column: z
		.enum(CONTRACT_ALLOWED_SORT_COLUMNS)
		.catch("createdAt")
		.default("createdAt"),
	direction: z.enum(["asc", "desc"]).catch("desc").default("desc"),
});

export type ContractSort = z.infer<typeof contractSortSchema>;
