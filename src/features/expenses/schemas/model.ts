import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const expenseDetailSchema = entityIdSchema.safeExtend({
	supplierId: z.number(),
	supplierName: z.string(),
	supplierDocument: z.string().nullable().default(null),
	negotiatedAmount: z.number(),
	notes: z.string().nullable(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
	hasGeneratedTitles: z.boolean().default(false),
});

export const expenseSummarySchema = expenseDetailSchema
	.pick({
		id: true,
		supplierId: true,
		supplierName: true,
		supplierDocument: true,
		negotiatedAmount: true,
		isActive: true,
		isSoftDeleted: true,
		createdAt: true,
	})
	.safeExtend({
		notes: z.string().nullable().default(null),
	});

export type ExpenseDetail = z.infer<typeof expenseDetailSchema>;
export type ExpenseSummary = z.infer<typeof expenseSummarySchema>;

export const expenseInstallmentSchema = z.object({
	id: z.number().int().positive(),
	kind: z.enum(["DOWN_PAYMENT", "INSTALLMENT", "EXTRA"]),
	dueDate: z.iso.date(),
	expectedAmount: z.number(),
	paidAmount: z.number(),
	principalAbated: z.number(),
	remainingAmount: z.number(),
	paymentDate: z.iso.date().nullable(),
	isCancelled: z.boolean(),
});

export const expenseFinancialSchema = z.object({
	paidAmount: z.number(),
	remainingAmount: z.number(),
	installments: z.array(expenseInstallmentSchema),
});

export type ExpenseInstallment = z.infer<typeof expenseInstallmentSchema>;
export type ExpenseFinancial = z.infer<typeof expenseFinancialSchema>;
