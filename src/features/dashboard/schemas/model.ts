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

export const dashboardRemunerationMonthSchema = z.object({
	key: z.string(),
	label: z.string(),
});

export const dashboardRemunerationRowSchema = z.object({
	employeeId: z.number(),
	employeeName: z.string(),
	months: z.record(z.string(), z.number()),
	total: z.number(),
	formattedTotal: z.string(),
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
	remunerationMonths: dashboardRemunerationMonthSchema.array(),
	remunerationTable: dashboardRemunerationRowSchema.array(),
	financialEvolutionLabel: z.string(),
	financialEvolution: dashboardFinancialEvolutionItemSchema.array(),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
