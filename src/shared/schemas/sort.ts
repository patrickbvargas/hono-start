import * as z from "zod";
import type { NonEmptyKeys } from "../types/utils";

const DEFAULT_ORDER = "asc";

const sortDirectionSchema = z
	.enum(["asc", "desc"])
	.catch(DEFAULT_ORDER)
	.default(DEFAULT_ORDER);

export const sortSchema = z.object({
	column: z.string().nullable().catch(null).default(null),
	direction: sortDirectionSchema,
});

export const createSortSchema = <T>(config: {
	columns: NonEmptyKeys<T> & string[];
	defaultColumn: keyof T & string;
}) => {
	return z.object({
		column: z
			.enum(config.columns)
			.catch(config.defaultColumn)
			.default(config.defaultColumn),
		direction: sortDirectionSchema,
	});
};

export type Sort = z.infer<typeof sortSchema>;
export type SortDirection = z.infer<typeof sortDirectionSchema>;
