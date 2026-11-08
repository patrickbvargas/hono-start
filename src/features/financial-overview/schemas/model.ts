import * as z from "zod";

export const financialMetricSchema = z.object({
	label: z.string(),
	drilldown: z.enum([
		"realized_balance",
		"projected_balance",
		"receivables",
		"payables",
	]),
	value: z.number(),
	formattedValue: z.string(),
	description: z.string(),
	tone: z.enum(["default", "success", "warning", "danger"]),
	currentValue: z.number(),
	previousValue: z.number().nullable().optional(),
	formattedCurrentValue: z.string(),
	formattedPreviousValue: z.string().nullable().optional(),
	previousLabel: z.string().nullable().optional(),
	previousPeriodLabel: z.string().nullable().optional(),
	changePercent: z.number().nullable(),
});

export type FinancialOverviewMetric = z.infer<typeof financialMetricSchema>;

export const monthlyCashFlowItemSchema = z.object({
	month: z.string(),
	monthLabel: z.string(),
	isFuture: z.boolean(),
	isCurrentMonth: z.boolean().default(false),
	entryRealized: z.number(),
	entryProjected: z.number(),
	entryTotal: z.number(),
	outputRealized: z.number(),
	outputProjected: z.number(),
	outputTotal: z.number(),
	balanceRealized: z.number(),
	balanceTotal: z.number(),
	// Table breakdown fields
	administrative: z.number(),
	judicial: z.number(),
	succumbency: z.number(),
	remunerationPaid: z.number(),
	expensePaid: z.number(),
});

export type MonthlyCashFlowItem = z.infer<typeof monthlyCashFlowItemSchema>;

export const breakdownItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	total: z.number(),
	formattedTotal: z.string(),
	percentage: z.number(),
});

export type BreakdownItem = z.infer<typeof breakdownItemSchema>;

export const financialOverviewSummarySchema = z.object({
	referenceDate: z.string(),
	metrics: z.array(financialMetricSchema),
	monthlyEvolution: z.array(monthlyCashFlowItemSchema),
	table: z.array(monthlyCashFlowItemSchema),
	expenseCategories: z.array(breakdownItemSchema),
	aging: z.array(breakdownItemSchema),
	forecast: z.array(breakdownItemSchema),
});

export type FinancialOverviewSummary = z.infer<
	typeof financialOverviewSummarySchema
>;
