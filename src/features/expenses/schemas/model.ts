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
