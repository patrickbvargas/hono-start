import * as z from "zod";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

export const paginationSchema = z.object({
	page: z.coerce
		.number()
		.catch(DEFAULT_PAGE)
		.transform((page) => Math.max(DEFAULT_PAGE, page)),
	limit: z.coerce
		.number()
		.catch(DEFAULT_LIMIT)
		.transform((limit) => Math.max(DEFAULT_LIMIT, limit)),
});

export type Pagination = z.infer<typeof paginationSchema>;
