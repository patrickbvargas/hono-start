import { Prisma } from "@/generated/prisma/client";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardSummary } from "../schemas/model";
import { dashboardSummarySchema } from "../schemas/model";
import { buildFinancialAnalysis } from "./analysis";
import { buildMonthlyCashFlow } from "./cash-flow";
import { buildMonthlyFinancialEvolution } from "./financial-evolution";
import { buildOverdueInstallmentRows } from "./overdue-installments";
import type { getDashboardRecords } from "./records";
import { buildMonthlyRemunerationTable } from "./remuneration";
import type { GroupTotal } from "./revenue";
import {
	calculateChangePercent,
	getRevenueReceived,
	mapBreakdown,
	pushGroupTotal,
	sumDecimal,
} from "./revenue";
import { getScheduledRevenue } from "./schedule";
import { canReadDashboardFirmResult } from "./scope";

export function buildDashboardSummary({
	scope,
	previousFees,
	previousStart,
	previousEndExclusive,
	previousLabel,
	previousPeriodLabel,
	period,
	chartMonthRange,
	revenues,
	allRemunerations,
	previousRemunerations,
	chartDownPayments,
	chartFees,
	chartRemunerations,
	tableRemunerations,
	allExpenses,
	previousExpenses,
	chartCashFlowDownPayments,
	chartCashFlowFees,
	chartCashFlowExpenses,
}: Awaited<ReturnType<typeof getDashboardRecords>>): DashboardSummary {
	const comparisonPeriod = {
		hasPeriod: true,
		dateFrom: previousStart,
		dateTo: new Date(previousEndExclusive.getTime() - 1),
	};
	const revenueTotal = getScheduledRevenue(revenues, period);
	const revenueReceived = sumDecimal(
		revenues.map((revenue) => getRevenueReceived(revenue, period)),
	);
	const currentPlannedRevenue = revenueTotal;
	const previousPlannedRevenue = getScheduledRevenue(
		revenues,
		comparisonPeriod,
	);
	const currentRevenue = revenueReceived;
	const previousRevenue = sumDecimal(previousFees.map((fee) => fee.amount)).add(
		sumDecimal(
			revenues
				.filter(
					(revenue) =>
						revenue.paymentStartDate >= previousStart &&
						revenue.paymentStartDate < previousEndExclusive,
				)
				.map((revenue) => new Prisma.Decimal(revenue.downPaymentValue ?? 0)),
		),
	);
	const showFirmResult = canReadDashboardFirmResult(scope);
	const currentRemuneration = sumDecimal(
		allRemunerations.map((remuneration) => remuneration.amount),
	);
	const previousRemuneration = sumDecimal(
		previousRemunerations.map((remuneration) => remuneration.amount),
	);
	const remunerationTotal = sumDecimal(
		allRemunerations.map((remuneration) => remuneration.amount),
	);
	const expenseTotal = sumDecimal(
		allExpenses.map((expense) => new Prisma.Decimal(expense.amount)),
	);
	const currentExpense = expenseTotal;
	const previousExpense = sumDecimal(
		previousExpenses.map((expense) => new Prisma.Decimal(expense.amount)),
	);
	const totalBalance = revenueReceived.minus(expenseTotal);
	const currentBalance = currentRevenue.minus(currentExpense);
	const previousBalance = previousRevenue.minus(previousExpense);
	const financialEvolution = buildMonthlyFinancialEvolution({
		chartDownPayments,
		chartFees,
		chartRemunerations,
		range: chartMonthRange,
	});
	const remunerationByCollaborator = buildMonthlyRemunerationTable({
		range: chartMonthRange,
		rows: tableRemunerations,
	});
	const overdueInstallments = buildOverdueInstallmentRows({
		period,
		revenues,
	});
	const cashFlow = showFirmResult
		? buildMonthlyCashFlow({
				chartDownPayments: chartCashFlowDownPayments,
				chartFees: chartCashFlowFees,
				chartRemunerations,
				chartExpenses: chartCashFlowExpenses,
				range: chartMonthRange,
			})
		: null;
	const legalAreaGroups = new Map<string, GroupTotal>();
	const revenueTypeGroups = new Map<string, GroupTotal>();

	for (const revenue of revenues) {
		const received = getRevenueReceived(revenue, period);
		pushGroupTotal(legalAreaGroups, {
			label: revenue.contract.legalArea.label,
			value: revenue.contract.legalArea.value,
			total: received,
		});
		pushGroupTotal(revenueTypeGroups, {
			label: revenue.type.label,
			value: revenue.type.value,
			total: received,
		});
	}

	const expenseGroups = new Map<string, GroupTotal>();
	for (const expense of allExpenses) {
		const label = expense.category?.label ?? "Outros";
		pushGroupTotal(expenseGroups, {
			label,
			value: expense.category?.value ?? label,
			total: new Prisma.Decimal(expense.amount),
		});
	}

	const assignmentGroups = new Map<string, GroupTotal>();
	const areaRemunerations = new Map<string, GroupTotal>();
	const typeRemunerations = new Map<string, GroupTotal>();
	for (const row of tableRemunerations) {
		const area = row.contractEmployee.contract?.legalArea;
		const type = row.fee?.revenue.type;
		if (area) {
			pushGroupTotal(areaRemunerations, {
				...area,
				total: new Prisma.Decimal(row.amount),
			});
		}
		if (type) {
			pushGroupTotal(typeRemunerations, {
				...type,
				total: new Prisma.Decimal(row.amount),
			});
		}
		const label = row.contractEmployee.assignmentType?.label ?? "Outros";
		pushGroupTotal(assignmentGroups, {
			label,
			value: row.contractEmployee.assignmentType?.value ?? label,
			total: new Prisma.Decimal(row.amount),
		});
	}
	const withRemunerations = (
		receipts: Map<string, GroupTotal>,
		remunerations: Map<string, GroupTotal>,
	) => {
		const groups = new Map(receipts);
		for (const [value, item] of remunerations) {
			if (!groups.has(value)) {
				groups.set(value, { ...item, total: new Prisma.Decimal(0) });
			}
		}
		return mapBreakdown(groups, revenueReceived).map((item) => ({
			...item,
			remuneration: Number(remunerations.get(item.value)?.total ?? 0),
		}));
	};

	const result = dashboardSummarySchema.parse({
		remunerationByCollaborator:
			scope.isAdmin &&
			scope.access?.remunerationAll === true &&
			scope.access?.remuneration === true
				? mapBreakdown(
						new Map(
							remunerationByCollaborator.table.map((row) => [
								String(row.employeeId),
								{
									value: String(row.employeeId),
									label: row.employeeName,
									total: new Prisma.Decimal(row.total),
								},
							]),
						),
						sumDecimal(
							remunerationByCollaborator.table.map(
								(row) => new Prisma.Decimal(row.total),
							),
						),
					)
				: undefined,
		isAdmin: scope.isAdmin,
		remunerationByAssignment: mapBreakdown(assignmentGroups, remunerationTotal),
		analysis: buildFinancialAnalysis(revenues, period),
		expenseRevenue: showFirmResult
			? mapBreakdown(expenseGroups, expenseTotal)
			: [],
		operatingRatios: showFirmResult
			? {
					margin: revenueReceived.equals(0)
						? null
						: Number(totalBalance.div(revenueReceived).mul(100)),
					remunerationShare: revenueReceived.equals(0)
						? null
						: Number(remunerationTotal.div(revenueReceived).mul(100)),
					expenses: formatter.currency(Number(expenseTotal)),
				}
			: null,
		scopeLabel: scope.isAdmin ? "Visão geral" : "Minha visão",
		metrics: [
			...(showFirmResult
				? [
						{
							label: "Resultado do período",
							drilldown: "result" as const,
							value: Number(totalBalance),
							formattedValue: formatter.currency(Number(totalBalance)),
							description:
								"Honorários recebidos − despesas. Não representa saldo bancário.",
							tone: Number(totalBalance) < 0 ? "danger" : "default",
							previousLabel,
							currentValue: Number(currentBalance),
							previousValue: Number(previousBalance),
							formattedCurrentValue: formatter.currency(Number(currentBalance)),
							formattedPreviousValue: formatter.currency(
								Number(previousBalance),
							),
							previousPeriodLabel,
							changePercent: calculateChangePercent(
								currentBalance,
								previousBalance,
							),
						},
					]
				: []),
			{
				label: "Honorários previstos",
				drilldown: "planned" as const,
				value: Number(revenueTotal),
				formattedValue: formatter.currency(Number(revenueTotal)),
				description:
					"Entradas + parcelas previstas. Inclui valores já recebidos.",
				tone: "default",
				previousLabel,
				currentValue: Number(currentPlannedRevenue),
				previousValue: Number(previousPlannedRevenue),
				formattedCurrentValue: formatter.currency(
					Number(currentPlannedRevenue),
				),
				formattedPreviousValue: formatter.currency(
					Number(previousPlannedRevenue),
				),
				previousPeriodLabel,
				changePercent: calculateChangePercent(
					currentPlannedRevenue,
					previousPlannedRevenue,
				),
			},
			{
				label: "Honorários recebidos",
				drilldown: "revenue" as const,
				value: Number(revenueReceived),
				formattedValue: formatter.currency(Number(revenueReceived)),
				description: "Entradas + pagamentos de honorários recebidos.",
				tone: "success",
				previousLabel,
				currentValue: Number(currentRevenue),
				previousValue: Number(previousRevenue),
				formattedCurrentValue: formatter.currency(Number(currentRevenue)),
				formattedPreviousValue: formatter.currency(Number(previousRevenue)),
				previousPeriodLabel,
				changePercent: calculateChangePercent(currentRevenue, previousRevenue),
			},
			{
				label: "Remunerações geradas",
				drilldown: "remuneration" as const,
				value: Number(remunerationTotal),
				formattedValue: formatter.currency(Number(remunerationTotal)),
				description:
					"Remunerações geradas. Indicador de conferência; não compõe as saídas.",
				tone: "warning",
				previousLabel,
				currentValue: Number(currentRemuneration),
				previousValue: Number(previousRemuneration),
				formattedCurrentValue: formatter.currency(Number(currentRemuneration)),
				formattedPreviousValue: formatter.currency(
					Number(previousRemuneration),
				),
				previousPeriodLabel,
				changePercent: calculateChangePercent(
					currentRemuneration,
					previousRemuneration,
				),
			},
		],
		legalAreaRevenue: withRemunerations(legalAreaGroups, areaRemunerations),
		revenueTypeRevenue: withRemunerations(revenueTypeGroups, typeRemunerations),
		remunerationMonths: remunerationByCollaborator.months,
		remunerationTable: remunerationByCollaborator.table,
		remunerationSubtotal: remunerationByCollaborator.subtotal,
		overdueInstallments,
		financialEvolutionLabel: chartMonthRange.label,
		financialEvolution: cashFlow
			? cashFlow.table.map((row) => ({
					month: row.month,
					revenue: row.entry,
					remuneration: row.remuneration,
					expense: row.expense,
					result: row.balance,
				}))
			: financialEvolution,
		cashFlow: cashFlow
			? {
					totalBalance: Number(totalBalance),
					formattedTotalBalance: formatter.currency(Number(totalBalance)),
					chartLabel: chartMonthRange.label,
					chart: cashFlow.chart,
					table: cashFlow.table,
				}
			: null,
	});
	const revenue = scope.access?.revenue === true;
	const remuneration = scope.access?.remuneration === true;
	const expense = scope.access?.expense === true;
	return dashboardSummarySchema.parse({
		...result,
		visibility: {
			revenue,
			remuneration,
			expense,
			evolution: revenue && remuneration,
		},
		metrics: result.metrics
			.filter((metric) =>
				metric.label === "Resultado do período"
					? showFirmResult
					: metric.label === "Remunerações geradas"
						? remuneration
						: revenue,
			)
			.concat(
				expense
					? [
							{
								label: "Despesas",
								drilldown: "expense" as const,
								value: Number(expenseTotal),
								formattedValue: formatter.currency(Number(expenseTotal)),
								description:
									"Despesas. Ignora filtros de colaborador, área e tipo de honorário.",
								tone: "default" as const,
								previousLabel,
								currentValue: Number(expenseTotal),
								previousValue: Number(previousExpense),
								formattedCurrentValue: formatter.currency(Number(expenseTotal)),
								formattedPreviousValue: formatter.currency(
									Number(previousExpense),
								),
								previousPeriodLabel,
								changePercent: calculateChangePercent(
									expenseTotal,
									previousExpense,
								),
							},
						]
					: [],
			),
		analysis: revenue ? result.analysis : undefined,
		legalAreaRevenue: revenue ? result.legalAreaRevenue : [],
		revenueTypeRevenue: revenue ? result.revenueTypeRevenue : [],
		overdueInstallments: revenue ? result.overdueInstallments : [],
		remunerationByAssignment: remuneration
			? result.remunerationByAssignment
			: undefined,
		remunerationMonths: remuneration ? result.remunerationMonths : [],
		remunerationTable: remuneration ? result.remunerationTable : [],
		remunerationSubtotal: remuneration ? result.remunerationSubtotal : null,
		financialEvolution:
			revenue && remuneration ? result.financialEvolution : [],
		expenseRevenue: expense ? mapBreakdown(expenseGroups, expenseTotal) : [],
	});
}
