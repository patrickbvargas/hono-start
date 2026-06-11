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

export const dashboardRemunerationSubtotalSchema = z.object({
	label: z.string(),
	months: z.record(z.string(), z.number()),
	total: z.number(),
	formattedTotal: z.string(),
});

export const dashboardOverdueInstallmentRowSchema = z.object({
	contractProcessNumber: z.string(),
	clientName: z.string(),
	lawyerName: z.string(),
	legalArea: z.string(),
	revenueType: z.string(),
	installmentNumber: z.number().int().positive(),
	dueDate: z.iso.datetime(),
	installmentAmount: z.number(),
	formattedInstallmentAmount: z.string(),
	totalValue: z.number(),
	formattedTotalValue: z.string(),
});

export const dashboardFinancialEvolutionItemSchema = z.object({
	month: z.string(),
	revenue: z.number(),
	remuneration: z.number(),
});

export const dashboardCashFlowChartItemSchema = z.object({
	month: z.string(),
	entry: z.number(),
	output: z.number(),
	balance: z.number(),
});

export const dashboardCashFlowRowSchema = z.object({
	month: z.string(),
	monthLabel: z.string(),
	administrative: z.number(),
	judicial: z.number(),
	succumbency: z.number(),
	entry: z.number(),
	remuneration: z.number(),
	expense: z.number(),
	output: z.number(),
	balance: z.number(),
});

export const dashboardCashFlowSchema = z.object({
	totalBalance: z.number(),
	formattedTotalBalance: z.string(),
	chartLabel: z.string(),
	chart: dashboardCashFlowChartItemSchema.array(),
	table: dashboardCashFlowRowSchema.array(),
});

export const dashboardSummarySchema = z.object({
	isAdmin: z.boolean(),
	scopeLabel: z.string(),
	metrics: dashboardMetricSchema.array(),
	legalAreaRevenue: dashboardBreakdownItemSchema.array(),
	revenueTypeRevenue: dashboardBreakdownItemSchema.array(),
	remunerationMonths: dashboardRemunerationMonthSchema.array(),
	remunerationTable: dashboardRemunerationRowSchema.array(),
	remunerationSubtotal: dashboardRemunerationSubtotalSchema.nullable(),
	overdueInstallments: dashboardOverdueInstallmentRowSchema.array(),
	financialEvolutionLabel: z.string(),
	financialEvolution: dashboardFinancialEvolutionItemSchema.array(),
	cashFlow: dashboardCashFlowSchema.nullable(),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
