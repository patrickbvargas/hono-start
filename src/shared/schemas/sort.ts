import * as z from "zod";

const DEFAULT_ORDER = "asc";

const sortOrderSchema = z
	.enum(["asc", "desc"])
	.catch(DEFAULT_ORDER)
	.default(DEFAULT_ORDER);

export type SortOrder = z.infer<typeof sortOrderSchema>;

export const sortSchema = z.object({
	sortBy: z.string().nullable().catch(null).default(null),
	sortOrder: sortOrderSchema,
});

export const createSortSchema = <T>(
	columns: [Extract<keyof T, string>, ...Extract<keyof T, string>[]],
	defaultColumn: Extract<keyof T, string>,
) => {
	return z.object({
		sortBy: z.enum(columns).catch(defaultColumn).default(defaultColumn),
		sortOrder: sortOrderSchema,
	});
};

export type Sort = z.infer<typeof sortSchema>;
