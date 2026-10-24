import * as z from "zod";
export const entityDetailSearchSchema = z.object({
	detailId: z.coerce
		.number()
		.int()
		.positive()
		.max(Number.MAX_SAFE_INTEGER)
		.optional()
		.catch(undefined),
});
