import { Prisma } from "@/generated/prisma/client";
import { formatter } from "@/shared/lib/formatter";
import {
	type BreakdownItem,
	type FinancialOverviewMetric,
	type FinancialOverviewSummary,
	financialOverviewSummarySchema,
	type MonthlyCashFlowItem,
} from "../schemas/model";
import {
	calculateChangePercent,
	getComparisonBoundaries,
} from "../utils/period";
import {
	type FinancialOverviewRecords,
	getCashEvents,
	getOutstanding,
} from "./records";

function getMonthKey(date: Date): string {
	const y = date.getUTCFullYear();
	const m = String(date.getUTCMonth() + 1).padStart(2, "0");
	return `${y}-${m}`;
}

function formatMonthLabel(date: Date): string {
	const months = [
		"Jan",
		"Fev",
		"Mar",
		"Abr",
		"Mai",
		"Jun",
		"Jul",
		"Ago",
		"Set",
		"Out",
		"Nov",
		"Dez",
	];
	const y = String(date.getUTCFullYear()).slice(2);
	return `${months[date.getUTCMonth()]}/${y}`;
}

export function buildFinancialOverviewSummary(
	records: FinancialOverviewRecords,
): FinancialOverviewSummary {
	const now = new Date();
	const currentMonthKey = getMonthKey(now);
	const reference = new Date();

	// 1. Determine months to display: 6 months before now to 3 months ahead
	const months: Array<{ key: string; label: string; date: Date }> = [];
	const start = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, 1),
	);
	const end = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 4, 0),
	);

	for (
		let d = new Date(start);
		d <= end;
		d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
	) {
		months.push({
			key: getMonthKey(d),
			label: formatMonthLabel(d),
			date: new Date(d),
		});
	}

	// 2. Aggregate movements and open titles
	interface CashEventWithContext {
		date: Date;
		amount: Prisma.Decimal;
		typeValue?: string;
		isRemuneration?: boolean;
		categoryValue?: string;
		categoryLabel?: string;
	}

	const receiptEvents: CashEventWithContext[] = [];
	const paymentEvents: CashEventWithContext[] = [];

	// Process Receivables
	interface OpenTitle {
		id: number;
		dueDate: Date;
		outstanding: Prisma.Decimal;
		typeValue?: string;
	}

	const openReceivables: OpenTitle[] = [];

	for (const title of records.receivables) {
		const bridge = title.contractRevenueReceivable;
		const typeVal = bridge?.revenue.revenueType.value;

		for (const event of getCashEvents(title.receipts)) {
			receiptEvents.push({
				date: event.date,
				amount: event.amount,
				typeValue: typeVal,
			});
		}

		const outstanding = getOutstanding(title, title.receipts, reference);
		if (outstanding.gt(0)) {
			openReceivables.push({
				id: title.id,
				dueDate: title.dueDate,
				outstanding,
				typeValue: typeVal,
			});
		}
	}

	// Process Payables
	interface OpenPayable {
		id: number;
		dueDate: Date;
		outstanding: Prisma.Decimal;
		isRemuneration: boolean;
		categoryValue?: string;
	}

	const openPayables: OpenPayable[] = [];

	for (const title of records.payables) {
		const isRemun = Boolean(title.remunerationPayable);
		const catVal = title.analytic.value;
		const catLab = title.analytic.label;

		for (const event of getCashEvents(title.payments)) {
			paymentEvents.push({
				date: event.date,
				amount: event.amount,
				isRemuneration: isRemun,
				categoryValue: catVal,
				categoryLabel: catLab,
			});
		}

		const outstanding = getOutstanding(title, title.payments, reference);
		if (outstanding.gt(0)) {
			openPayables.push({
				id: title.id,
				dueDate: title.dueDate,
				outstanding,
				isRemuneration: isRemun,
				categoryValue: catVal,
			});
		}
	}

	// 3. Build monthly table and chart series
	const monthlyEvolution: MonthlyCashFlowItem[] = months.map((m) => {
		const isFuture = m.key > currentMonthKey;
		const isCurrentMonth = m.key === currentMonthKey;
		const allowsProjected = isCurrentMonth || isFuture;

		// Actual receipts in this month
		const monthReceipts = receiptEvents.filter(
			(e) => getMonthKey(e.date) === m.key,
		);
		const entryRealized = monthReceipts.reduce(
			(sum, e) => sum.add(e.amount),
			new Prisma.Decimal(0),
		);

		// Projected open receivables: only for current month and future months
		const monthOpenReceivables = allowsProjected
			? openReceivables.filter((r) => getMonthKey(r.dueDate) === m.key)
			: [];
		const entryProjected = monthOpenReceivables.reduce(
			(sum, r) => sum.add(r.outstanding),
			new Prisma.Decimal(0),
		);

		// Actual payments in this month
		const monthPayments = paymentEvents.filter(
			(e) => getMonthKey(e.date) === m.key,
		);
		const outputRealized = monthPayments.reduce(
			(sum, e) => sum.add(e.amount),
			new Prisma.Decimal(0),
		);

		// Projected open payables: only for current month and future months
		const monthOpenPayables = allowsProjected
			? openPayables.filter((p) => getMonthKey(p.dueDate) === m.key)
			: [];
		const outputProjected = monthOpenPayables.reduce(
			(sum, p) => sum.add(p.outstanding),
			new Prisma.Decimal(0),
		);

		// Breakdown
		const adminReceipts = monthReceipts
			.filter((e) => e.typeValue === "ADMINISTRATIVE")
			.reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));

		const judicialReceipts = monthReceipts
			.filter((e) => e.typeValue === "JUDICIAL")
			.reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));

		const succumbencyReceipts = monthReceipts
			.filter((e) => e.typeValue === "SUCCUMBENCY")
			.reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));

		const remunPayments = monthPayments
			.filter((e) => e.isRemuneration)
			.reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));

		const expensePayments = monthPayments
			.filter((e) => !e.isRemuneration)
			.reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));

		const entryTotal = entryRealized.add(entryProjected);
		const outputTotal = outputRealized.add(outputProjected);
		const balanceRealized = entryRealized.minus(outputRealized);
		const balanceTotal = entryTotal.minus(outputTotal);

		return {
			month: m.key,
			monthLabel: m.label,
			isFuture,
			isCurrentMonth,
			entryRealized: Number(entryRealized),
			entryProjected: Number(entryProjected),
			entryTotal: Number(entryTotal),
			outputRealized: Number(outputRealized),
			outputProjected: Number(outputProjected),
			outputTotal: Number(outputTotal),
			balanceRealized: Number(balanceRealized),
			balanceTotal: Number(balanceTotal),
			administrative: Number(adminReceipts),
			judicial: Number(judicialReceipts),
			succumbency: Number(succumbencyReceipts),
			remunerationPaid: Number(remunPayments),
			expensePaid: Number(expensePayments),
		};
	});

	// 4. Totals & comparative evolution for metric cards
	const previous = getComparisonBoundaries(records.scope.search);
	const currentStart = previous.currentStart;
	const currentEnd = new Date(previous.nextStart.getTime() - 1);
	const previousStart = previous.previousStart;
	const previousEnd = new Date(previous.previousEndExclusive.getTime() - 1);

	const isInside = (date: Date, start: Date, end: Date) =>
		date >= start && date <= end;

	const currentReceipts = receiptEvents
		.filter((e) => isInside(e.date, currentStart, currentEnd))
		.reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));

	const currentPayments = paymentEvents
		.filter((e) => isInside(e.date, currentStart, currentEnd))
		.reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));

	const realizedBalance = currentReceipts.minus(currentPayments);

	const prevReceipts = receiptEvents
		.filter((e) => isInside(e.date, previousStart, previousEnd))
		.reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));

	const prevPayments = paymentEvents
		.filter((e) => isInside(e.date, previousStart, previousEnd))
		.reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));

	const prevRealizedBalance = prevReceipts.minus(prevPayments);
	const changePercentRealized = calculateChangePercent(
		realizedBalance,
		prevRealizedBalance,
	);

	const isCurrentOrFuture = (date: Date) =>
		getMonthKey(date) >= currentMonthKey;

	const futureOpenReceivables = openReceivables.filter((r) =>
		isCurrentOrFuture(r.dueDate),
	);
	const futureOpenPayables = openPayables.filter((p) =>
		isCurrentOrFuture(p.dueDate),
	);

	const currentOpenReceivables = futureOpenReceivables
		.filter((r) => isInside(r.dueDate, currentStart, currentEnd))
		.reduce((sum, r) => sum.add(r.outstanding), new Prisma.Decimal(0));

	const prevOpenReceivables = openReceivables
		.filter((r) => isInside(r.dueDate, previousStart, previousEnd))
		.reduce((sum, r) => sum.add(r.outstanding), new Prisma.Decimal(0));

	const totalOpenReceivables = currentOpenReceivables.gt(0)
		? currentOpenReceivables
		: futureOpenReceivables.reduce(
				(sum, r) => sum.add(r.outstanding),
				new Prisma.Decimal(0),
			);

	const changePercentReceivables = calculateChangePercent(
		totalOpenReceivables,
		prevOpenReceivables,
	);

	const currentOpenPayables = futureOpenPayables
		.filter((p) => isInside(p.dueDate, currentStart, currentEnd))
		.reduce((sum, p) => sum.add(p.outstanding), new Prisma.Decimal(0));

	const prevOpenPayables = openPayables
		.filter((p) => isInside(p.dueDate, previousStart, previousEnd))
		.reduce((sum, p) => sum.add(p.outstanding), new Prisma.Decimal(0));

	const totalOpenPayables = currentOpenPayables.gt(0)
		? currentOpenPayables
		: futureOpenPayables.reduce(
				(sum, p) => sum.add(p.outstanding),
				new Prisma.Decimal(0),
			);

	const changePercentPayables = calculateChangePercent(
		totalOpenPayables,
		prevOpenPayables,
	);

	const projectedBalance = realizedBalance
		.add(totalOpenReceivables)
		.minus(totalOpenPayables);

	const prevProjectedBalance = prevRealizedBalance
		.add(prevOpenReceivables)
		.minus(prevOpenPayables);

	const changePercentProjected = calculateChangePercent(
		projectedBalance,
		prevProjectedBalance,
	);

	const metrics: FinancialOverviewMetric[] = [
		{
			label: "Saldo Realizado",
			drilldown: "realized_balance",
			value: Number(realizedBalance),
			formattedValue: formatter.currency(Number(realizedBalance)),
			description:
				"Total de entradas recebidas menos saídas pagas registradas.",
			tone: realizedBalance.gte(0) ? "success" : "danger",
			currentValue: Number(realizedBalance),
			previousValue: Number(prevRealizedBalance),
			formattedCurrentValue: formatter.currency(Number(realizedBalance)),
			formattedPreviousValue: formatter.currency(Number(prevRealizedBalance)),
			previousLabel: previous.previousLabel,
			previousPeriodLabel: previous.previousPeriodLabel,
			changePercent: changePercentRealized,
		},
		{
			label: "Saldo Projetado",
			drilldown: "projected_balance",
			value: Number(projectedBalance),
			formattedValue: formatter.currency(Number(projectedBalance)),
			description:
				"Saldo realizado somado aos recebíveis futuros menos pagamentos futuros.",
			tone: projectedBalance.gte(0) ? "success" : "danger",
			currentValue: Number(projectedBalance),
			previousValue: Number(prevProjectedBalance),
			formattedCurrentValue: formatter.currency(Number(projectedBalance)),
			formattedPreviousValue: formatter.currency(Number(prevProjectedBalance)),
			previousLabel: previous.previousLabel,
			previousPeriodLabel: previous.previousPeriodLabel,
			changePercent: changePercentProjected,
		},
		{
			label: "Total a Receber",
			drilldown: "receivables",
			value: Number(totalOpenReceivables),
			formattedValue: formatter.currency(Number(totalOpenReceivables)),
			description: "Títulos a receber pendentes (vencidos e a vencer).",
			tone: "default",
			currentValue: Number(totalOpenReceivables),
			previousValue: Number(prevOpenReceivables),
			formattedCurrentValue: formatter.currency(Number(totalOpenReceivables)),
			formattedPreviousValue: formatter.currency(Number(prevOpenReceivables)),
			previousLabel: previous.previousLabel,
			previousPeriodLabel: previous.previousPeriodLabel,
			changePercent: changePercentReceivables,
		},
		{
			label: "Total a Pagar",
			drilldown: "payables",
			value: Number(totalOpenPayables),
			formattedValue: formatter.currency(Number(totalOpenPayables)),
			description: "Títulos a pagar pendentes (despesas e remunerações).",
			tone: "warning",
			currentValue: Number(totalOpenPayables),
			previousValue: Number(prevOpenPayables),
			formattedCurrentValue: formatter.currency(Number(totalOpenPayables)),
			formattedPreviousValue: formatter.currency(Number(prevOpenPayables)),
			previousLabel: previous.previousLabel,
			previousPeriodLabel: previous.previousPeriodLabel,
			changePercent: changePercentPayables,
		},
	];

	// 5. Aging & Forecast buckets for receivables
	const agingLabels = [
		"Até 30 dias",
		"31–60 dias",
		"61–90 dias",
		"Acima de 90 dias",
	];
	const forecastLabels = ["Próximos 30 dias", "31–60 dias", "61–90 dias"];

	const getDaysDiff = (due: Date) =>
		Math.round(
			(Date.parse(due.toISOString().slice(0, 10)) -
				Date.parse(reference.toISOString().slice(0, 10))) /
				86400000,
		);

	const aging: BreakdownItem[] = agingLabels.map((label) => {
		const items = openReceivables.filter((r) => {
			const diff = getDaysDiff(r.dueDate);
			if (diff >= 0) {
				return false;
			}
			const age = -diff;
			if (label === "Até 30 dias") {
				return age <= 30;
			}
			if (label === "31–60 dias") {
				return age > 30 && age <= 60;
			}
			if (label === "61–90 dias") {
				return age > 60 && age <= 90;
			}
			return age > 90;
		});
		const amount = items.reduce(
			(sum, i) => sum.add(i.outstanding),
			new Prisma.Decimal(0),
		);
		return {
			label,
			value: label,
			total: Number(amount),
			formattedTotal: formatter.currency(Number(amount)),
			percentage: totalOpenReceivables.gt(0)
				? Number(amount.div(totalOpenReceivables).mul(100))
				: 0,
		};
	});

	const forecast: BreakdownItem[] = forecastLabels.map((label) => {
		const items = openReceivables.filter((r) => {
			const diff = getDaysDiff(r.dueDate);
			if (diff < 0) {
				return false;
			}
			if (label === "Próximos 30 dias") {
				return diff <= 30;
			}
			if (label === "31–60 dias") {
				return diff > 30 && diff <= 60;
			}
			return diff > 60 && diff <= 90;
		});
		const amount = items.reduce(
			(sum, i) => sum.add(i.outstanding),
			new Prisma.Decimal(0),
		);
		return {
			label,
			value: label,
			total: Number(amount),
			formattedTotal: formatter.currency(Number(amount)),
			percentage: totalOpenReceivables.gt(0)
				? Number(amount.div(totalOpenReceivables).mul(100))
				: 0,
		};
	});

	// 6. Expense breakdown by analytic category
	const categoryMap = new Map<
		string,
		{ label: string; amount: Prisma.Decimal }
	>();
	for (const event of paymentEvents) {
		if (event.categoryLabel && event.categoryValue) {
			const existing = categoryMap.get(event.categoryValue) ?? {
				label: event.categoryLabel,
				amount: new Prisma.Decimal(0),
			};
			existing.amount = existing.amount.add(event.amount);
			categoryMap.set(event.categoryValue, existing);
		}
	}

	const totalPaymentsAmount = [...categoryMap.values()].reduce(
		(sum, c) => sum.add(c.amount),
		new Prisma.Decimal(0),
	);

	const expenseCategories: BreakdownItem[] = [...categoryMap.entries()].map(
		([value, item]) => ({
			label: item.label,
			value,
			total: Number(item.amount),
			formattedTotal: formatter.currency(Number(item.amount)),
			percentage: totalPaymentsAmount.gt(0)
				? Number(item.amount.div(totalPaymentsAmount).mul(100))
				: 0,
		}),
	);

	return financialOverviewSummarySchema.parse({
		referenceDate: reference.toISOString(),
		metrics,
		monthlyEvolution,
		table: monthlyEvolution,
		expenseCategories,
		aging,
		forecast,
	});
}
