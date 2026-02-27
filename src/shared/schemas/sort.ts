import * as z from "zod";
import type { NonEmptyKeys } from "../types/utils";

const DEFAULT_ORDER = "asc";

const sortOrderSchema = z
	.enum(["asc", "desc"])
	.catch(DEFAULT_ORDER)
	.default(DEFAULT_ORDER);

export const sortSchema = z.object({
	sortBy: z.string().nullable().catch(null).default(null),
	sortOrder: sortOrderSchema,
});

export const createSortSchema = <T>(config: {
	columns: NonEmptyKeys<T> & string[];
	defaultColumn: keyof T & string;
}) => {
	return z.object({
		sortBy: z
			.enum(config.columns)
			.catch(config.defaultColumn)
			.default(config.defaultColumn),
		sortOrder: sortOrderSchema,
	});
};

export type Sort = z.infer<typeof sortSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
