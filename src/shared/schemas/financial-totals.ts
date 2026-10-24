import * as z from "zod";

export const financialTotalsSchema = z.object({
	totalAmount: z.number().finite(),
});
