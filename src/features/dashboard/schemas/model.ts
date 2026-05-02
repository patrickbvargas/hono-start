import * as z from "zod";

export const dashboardMetricSchema = z.object({
	label: z.string(),
	value: z.number(),
	formattedValue: z.string(),
	description: z.string(),
	tone: z.enum(["default", "success", "warning", "danger"]),
	previousLabel: z.string(),
	currentValue: z.number(),
	previousValue: z.number(),
	formattedCurrentValue: z.string(),
	formattedPreviousValue: z.string(),
	previousPeriodLabel: z.string(),
	changePercent: z.number(),
});

export const dashboardBreakdownItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	total: z.number(),
	formattedTotal: z.string(),
	percentage: z.number(),
});

export const dashboardActivitySchema = z.object({
	id: z.string(),
	type: z.enum(["client", "contract", "fee", "remuneration"]),
	label: z.string(),
	description: z.string(),
	date: z.string(),
	formattedDate: z.string(),
	amount: z.number().nullable(),
	formattedAmount: z.string().nullable(),
});

export const dashboardFinancialEvolutionItemSchema = z.object({
	month: z.string(),
	revenue: z.number(),
	remuneration: z.number(),
});

export const dashboardSummarySchema = z.object({
	isAdmin: z.boolean(),
	scopeLabel: z.string(),
	metrics: dashboardMetricSchema.array(),
	legalAreaRevenue: dashboardBreakdownItemSchema.array(),
	revenueTypeRevenue: dashboardBreakdownItemSchema.array(),
	financialEvolutionLabel: z.string(),
	financialEvolution: dashboardFinancialEvolutionItemSchema.array(),
	recentActivity: dashboardActivitySchema.array(),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
