import * as z from "zod";
import { entityIdSchema } from "@/shared/schemas/entity";

export const expenseDetailSchema = entityIdSchema.safeExtend({
	categoryId: z.number(),
	category: z.string(),
	categoryValue: z.string(),
	expenseDate: z.iso.datetime(),
	amount: z.number(),
	notes: z.string().nullable(),
	isActive: z.boolean(),
	isSoftDeleted: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullable(),
});

export const expenseSummarySchema = expenseDetailSchema.pick({
	id: true,
	category: true,
	categoryValue: true,
	expenseDate: true,
	amount: true,
	isActive: true,
	isSoftDeleted: true,
	createdAt: true,
});

export type ExpenseDetail = z.infer<typeof expenseDetailSchema>;
export type ExpenseSummary = z.infer<typeof expenseSummarySchema>;
