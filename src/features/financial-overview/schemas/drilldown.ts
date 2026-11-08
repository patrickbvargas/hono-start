import * as z from "zod";
import { financialOverviewSearchSchema } from "./search";

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const financialDrilldownSelectionSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("metric"),
		value: z.enum([
			"realized_balance",
			"projected_balance",
			"receivables",
			"payables",
		]),
	}),
	z.object({
		kind: z.literal("monthly"),
		month,
		series: z.enum([
			"entryRealized",
			"entryProjected",
			"entryTotal",
			"outputRealized",
			"outputProjected",
			"outputTotal",
			"balanceRealized",
			"balanceTotal",
			"administrative",
			"judicial",
			"succumbency",
			"remunerationPaid",
			"expensePaid",
		]),
	}),
	z.object({
		kind: z.literal("aging"),
		value: z.enum([
			"Até 30 dias",
			"31–60 dias",
			"61–90 dias",
			"Acima de 90 dias",
		]),
	}),
	z.object({
		kind: z.literal("forecast"),
		value: z.enum(["Próximos 30 dias", "31–60 dias", "61–90 dias"]),
	}),
	z.object({
		kind: z.literal("category"),
		value: z.string().min(1),
	}),
]);

export type FinancialDrilldownSelection = z.infer<
	typeof financialDrilldownSelectionSchema
>;

export const financialDrilldownInputSchema = z.object({
	selection: financialDrilldownSelectionSchema,
	search: financialOverviewSearchSchema,
	referenceAt: z.string().datetime(),
});

export type FinancialDrilldownInput = z.infer<
	typeof financialDrilldownInputSchema
>;

export const financialRecordTargetSchema = z.object({
	kind: z.enum(["contract", "receivable", "payable", "expense"]),
	id: z.number().int().positive(),
});

export type FinancialRecordTarget = z.infer<typeof financialRecordTargetSchema>;

export const financialDrilldownRowSchema = z.object({
	id: z.string(),
	record: financialRecordTargetSchema,
	date: z.string().datetime(),
	kind: z.string(),
	description: z.string(),
	client: z.string().optional(),
	clientId: z.number().int().positive().optional(),
	process: z.string().optional(),
	type: z.string().optional(),
	typeValue: z.string().optional(),
	employee: z.string().optional(),
	employeeId: z.number().int().positive().optional(),
	assignment: z.string().optional(),
	assignmentValue: z.string().optional(),
	category: z.string().optional(),
	categoryValue: z.string().optional(),
	installment: z.number().optional(),
	faceAmount: z.number().optional(),
	paid: z.number().optional(),
	amount: z.number(),
});

export type FinancialDrilldownRow = z.infer<typeof financialDrilldownRowSchema>;

export const financialDrilldownResultSchema = z.object({
	data: z.array(financialDrilldownRowSchema),
	total: z.number().int().nonnegative(),
	amount: z.number(),
	entries: z.number(),
	deductions: z.number(),
});

export type FinancialDrilldownResult = z.infer<
	typeof financialDrilldownResultSchema
>;
