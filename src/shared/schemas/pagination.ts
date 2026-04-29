import * as z from "zod";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

export const paginationSchema = z.object({
	page: z.coerce
		.number()
		.catch(DEFAULT_PAGE)
		.transform((page) => (page >= DEFAULT_PAGE ? page : DEFAULT_PAGE)),
	limit: z.coerce
		.number()
		.catch(DEFAULT_LIMIT)
		.transform((limit) => (limit > 0 ? limit : DEFAULT_LIMIT)),
});

export type Pagination = z.infer<typeof paginationSchema>;
