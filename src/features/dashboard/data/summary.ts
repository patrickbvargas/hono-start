import { Prisma } from "@/generated/prisma/client";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardSummary } from "../schemas/model";
import { dashboardSummarySchema } from "../schemas/model";
import { isDateInsidePeriod, isDateInsideRange } from "../utils/period";
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

export function buildDashboardSummary({
	scope,
	currentStart,
	nextStart,
	previousStart,
	previousEndExclusive,
	previousLabel,
	previousPeriodLabel,
	period,
	chartMonthRange,
	revenues,
	currentFees,
	previousFees,
	allRemunerations,
	currentRemunerations,
	previousRemunerations,
	chartDownPayments,
	chartFees,
	chartRemunerations,
	tableRemunerations,
	allExpenses,
	currentExpenses,
	previousExpenses,
	chartCashFlowDownPayments,
	chartCashFlowFees,
	chartCashFlowExpenses,
}: Awaited<ReturnType<typeof getDashboardRecords>>): DashboardSummary {
	const revenueTotal = sumDecimal(
		revenues
			.filter((revenue) => isDateInsidePeriod(revenue.paymentStartDate, period))
			.map((revenue) => revenue.totalValue),
	);
	const revenueReceived = sumDecimal(
		revenues.map((revenue) => getRevenueReceived(revenue, period)),
	);
	const currentPlannedRevenue = sumDecimal(
		revenues
			.filter((revenue) =>
				isDateInsideRange(revenue.paymentStartDate, currentStart, nextStart),
			)
			.map((revenue) => revenue.totalValue),
	);
	const previousPlannedRevenue = sumDecimal(
		revenues
			.filter((revenue) =>
				isDateInsideRange(
					revenue.paymentStartDate,
					previousStart,
					previousEndExclusive,
				),
			)
			.map((revenue) => revenue.totalValue),
	);
	const currentRevenue = sumDecimal(currentFees.map((fee) => fee.amount));
	const previousRevenue = sumDecimal(previousFees.map((fee) => fee.amount));
	const currentRemuneration = sumDecimal(
		currentRemunerations.map((remuneration) => remuneration.amount),
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
	const currentExpense = sumDecimal(
		currentExpenses.map((expense) => new Prisma.Decimal(expense.amount)),
	);
	const previousExpense = sumDecimal(
		previousExpenses.map((expense) => new Prisma.Decimal(expense.amount)),
	);
	const totalBalance = revenueReceived
		.minus(remunerationTotal)
		.minus(expenseTotal);
	const currentBalance = currentRevenue
		.minus(currentRemuneration)
		.minus(currentExpense);
	const previousBalance = previousRevenue
		.minus(previousRemuneration)
		.minus(previousExpense);
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
	const cashFlow =
		scope.isAdmin && scope.canReadCashFlow === true
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

	return dashboardSummarySchema.parse({
		isAdmin: scope.isAdmin,
		scopeLabel: scope.isAdmin ? "Visão da firma" : "Minha visão",
		metrics: [
			...(scope.isAdmin && scope.canReadCashFlow === true
				? [
						{
							label: "Saldo total",
							value: Number(totalBalance),
							formattedValue: formatter.currency(Number(totalBalance)),
							description:
								"Total de honorários recebidos menos remunerações e despesas.",
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
				label: "Receita prevista",
				value: Number(revenueTotal),
				formattedValue: formatter.currency(Number(revenueTotal)),
				description:
					"Total de honorários previsto para recebimento no período.",
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
				label: "Receita recebida",
				value: Number(revenueReceived),
				formattedValue: formatter.currency(Number(revenueReceived)),
				description: "Total de honorários recebido no período.",
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
				label: "Remunerações",
				value: Number(remunerationTotal),
				formattedValue: formatter.currency(Number(remunerationTotal)),
				description: "Total gerado para colaboradores no período.",
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
		legalAreaRevenue: mapBreakdown(legalAreaGroups, revenueReceived),
		revenueTypeRevenue: mapBreakdown(revenueTypeGroups, revenueReceived),
		remunerationMonths: remunerationByCollaborator.months,
		remunerationTable: remunerationByCollaborator.table,
		remunerationSubtotal: remunerationByCollaborator.subtotal,
		overdueInstallments,
		financialEvolutionLabel: chartMonthRange.label,
		financialEvolution,
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
}
