import * as z from "zod";
import { optionSchema } from "@/shared/schemas/option";

export const receivableSummarySchema = z.object({
	isAssignedToActor: z.boolean(),
	id: z.number().int().positive(),
	debtorId: z.number().int(),
	debtorPersonId: z.number().int(),
	debtorName: z.string(),
	contractId: z.number().int().nullable(),
	processNumber: z.string().nullable(),
	revenueId: z.number().int().nullable(),
	kind: z.enum(["DOWN_PAYMENT", "INSTALLMENT", "EXTRA"]),
	dueDate: z.string(),
	amount: z.number(),
	principalAbated: z.number(),
	balance: z.number(),
	cashReceived: z.number(),
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
export type ReceivableSummary = z.infer<typeof receivableSummarySchema>;
export const receivablePageSchema = z.object({
	data: receivableSummarySchema.array(),
	total: z.number(),
	totals: z.object({
		amount: z.number(),
		principalAbated: z.number(),
		balance: z.number(),
		overdue: z.number(),
		cancelled: z.number(),
	}),
});
export type ReceivablePage = z.infer<typeof receivablePageSchema>;
export const receivableOptionsSchema = z.object({
	debtors: optionSchema.array(),
	contracts: optionSchema.array(),
	analytics: optionSchema.array(),
	methods: optionSchema.array(),
});
export const receivableReceiptSchema = z.object({
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
export type ReceivableReceipt = z.infer<typeof receivableReceiptSchema>;

export type ReceivableOptions = z.infer<typeof receivableOptionsSchema>;
