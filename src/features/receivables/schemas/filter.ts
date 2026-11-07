import * as z from "zod";

const optionalId = z.coerce
	.number()
	.int()
	.positive()
	.optional()
	.catch(undefined);
const date = z.union([z.iso.date(), z.literal("")]).catch("");
export const receivableFilterSchema = z.object({
	query: z.string().trim().catch(""),
	debtorId: optionalId,
	contractId: optionalId,
	origin: z.enum(["", "contract", "direct"]).catch(""),
	kind: z.enum(["", "DOWN_PAYMENT", "INSTALLMENT", "EXTRA"]).catch(""),
	state: z
		.enum(["", "pending", "overdue", "partial", "settled", "cancelled"])
		.catch(""),
	dateFrom: date,
	dateTo: date,
	analytic: z.string().catch(""),
	expectedMethod: z.string().catch(""),
});
export type ReceivableFilter = z.infer<typeof receivableFilterSchema>;
