import * as z from "zod";
import { optionSchema } from "@/shared/schemas/option";

export const payableSummarySchema = z.object({
	isAssignedToActor: z.boolean(),
	id: z.number().int().positive(),
	beneficiaryId: z.number().int(),
	beneficiaryPersonId: z.number().int(),
	beneficiaryName: z.string(),
	contractId: z.number().int().nullable(),
	processNumber: z.string().nullable(),
	expenseId: z.number().int().nullable(),
	isRemuneration: z.boolean(),
	origin: z.enum(["expense", "remuneration", "direct"]),
	kind: z.enum(["DOWN_PAYMENT", "INSTALLMENT", "EXTRA"]),
	dueDate: z.string(),
	amount: z.number(),
	principalAbated: z.number(),
	balance: z.number(),
	cashPaid: z.number(),
	situation: z.enum(["pending", "overdue", "partial", "settled", "cancelled"]),
	isPartial: z.boolean(),
	analytic: z.string(),
	analyticValue: z.string(),
	expectedMethod: z.string(),
	expectedMethodValue: z.string(),
	notes: z.string().nullable(),
	cancelledAt: z.string().nullable(),
	cancellationReason: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type PayableSummary = z.infer<typeof payableSummarySchema>;
export const payablePageSchema = z.object({
	data: payableSummarySchema.array(),
	total: z.number(),
	totals: z.object({
		amount: z.number(),
		principalAbated: z.number(),
		balance: z.number(),
		overdue: z.number(),
		cancelled: z.number(),
	}),
});
export type PayablePage = z.infer<typeof payablePageSchema>;
export const payableOptionsSchema = z.object({
	beneficiaries: optionSchema.array(),
	contracts: optionSchema.array(),
	analytics: optionSchema.array(),
	methods: optionSchema.array(),
});
export const payablePaymentSchema = z.object({
	id: z.number(),
	effectiveDate: z.string(),
	principalAbated: z.number(),
	discount: z.number(),
	interest: z.number(),
	penalty: z.number(),
	effectiveAmount: z.number(),
	actualMethod: z.string(),
	reversal: z
		.object({ effectiveDate: z.string(), reason: z.string() })
		.nullable(),
});
export type PayablePayment = z.infer<typeof payablePaymentSchema>;

export type PayableOptions = z.infer<typeof payableOptionsSchema>;
