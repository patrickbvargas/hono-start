import * as z from "zod";
import type { NonEmptyKeys } from "../types/utils";

const DEFAULT_ORDER = "asc";

interface CreateSortSchemaConfig<T> {
	columns: NonEmptyKeys<T> & string[];
	defaultColumn: keyof T & string;
	defaultDirection?: SortDirection;
}

const sortDirectionSchema = z
	.enum(["asc", "desc"])
	.catch(DEFAULT_ORDER)
	.default(DEFAULT_ORDER);

export const sortSchema = z.object({
	column: z.string().nullable().catch(null).default(null),
	direction: sortDirectionSchema,
});

export const createSortSchema = <T>(config: CreateSortSchemaConfig<T>) => {
	const defaultDirection = config.defaultDirection ?? DEFAULT_ORDER;

	return z.object({
		column: z
			.enum(config.columns)
			.catch(config.defaultColumn)
			.default(config.defaultColumn),
		direction: z
			.enum(["asc", "desc"])
			.catch(defaultDirection)
			.default(defaultDirection),
	});
};

export type Sort = z.infer<typeof sortSchema>;
export type SortDirection = z.infer<typeof sortDirectionSchema>;
