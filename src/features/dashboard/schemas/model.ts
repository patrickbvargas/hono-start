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
	changePercent: z.number().nullable(),
});

export type DashboardMetric = z.infer<typeof dashboardMetricSchema>;

export const dashboardBreakdownItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	total: z.number(),
	formattedTotal: z.string(),
	percentage: z.number(),
});

export type DashboardBreakdownItem = z.infer<
	typeof dashboardBreakdownItemSchema
>;

export const dashboardRemunerationMonthSchema = z.object({
	key: z.string(),
	label: z.string(),
});

export type DashboardRemunerationMonth = z.infer<
	typeof dashboardRemunerationMonthSchema
>;

export const dashboardRemunerationRowSchema = z.object({
	employeeId: z.number(),
	employeeName: z.string(),
	months: z.record(z.string(), z.number()),
	total: z.number(),
	formattedTotal: z.string(),
});

export type DashboardRemunerationRow = z.infer<
	typeof dashboardRemunerationRowSchema
>;

export const dashboardRemunerationSubtotalSchema = z.object({
	label: z.string(),
	months: z.record(z.string(), z.number()),
	total: z.number(),
	formattedTotal: z.string(),
});

export type DashboardRemunerationSubtotal = z.infer<
	typeof dashboardRemunerationSubtotalSchema
>;

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

export type DashboardOverdueInstallmentRow = z.infer<
	typeof dashboardOverdueInstallmentRowSchema
>;

export const dashboardFinancialEvolutionItemSchema = z.object({
	month: z.string(),
	revenue: z.number(),
	expense: z.number().optional(),
	result: z.number().optional(),
	remuneration: z.number(),
});

export type DashboardFinancialEvolutionItem = z.infer<
	typeof dashboardFinancialEvolutionItemSchema
>;

export const dashboardCashFlowChartItemSchema = z.object({
	month: z.string(),
	entry: z.number(),
	output: z.number(),
	balance: z.number(),
});

export type DashboardCashFlowChartItem = z.infer<
	typeof dashboardCashFlowChartItemSchema
>;

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

export type DashboardCashFlowRow = z.infer<typeof dashboardCashFlowRowSchema>;

export const dashboardCashFlowSchema = z.object({
	totalBalance: z.number(),
	formattedTotalBalance: z.string(),
	chartLabel: z.string(),
	chart: dashboardCashFlowChartItemSchema.array(),
	table: dashboardCashFlowRowSchema.array(),
});

export type DashboardCashFlow = z.infer<typeof dashboardCashFlowSchema>;

export const dashboardSummarySchema = z.object({
	visibility: z
		.object({
			revenue: z.boolean(),
			remuneration: z.boolean(),
			expense: z.boolean(),
			evolution: z.boolean(),
		})
		.optional(),
	remunerationByAssignment: dashboardBreakdownItemSchema.array().optional(),
	analysis: z
		.object({
			referenceLabel: z.string(),
			overdueTotal: z.string(),
			aging: dashboardBreakdownItemSchema.array(),
			forecast: dashboardBreakdownItemSchema.array(),
			clients: dashboardBreakdownItemSchema.array(),
		})
		.optional(),
	expenseRevenue: dashboardBreakdownItemSchema.array().optional(),
	operatingRatios: z
		.object({
			margin: z.number().nullable(),
			remunerationShare: z.number().nullable(),
			expenses: z.string(),
		})
		.nullable()
		.optional(),
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
