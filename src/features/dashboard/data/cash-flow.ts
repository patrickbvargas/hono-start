import { Prisma } from "@/generated/prisma/client";
import type {
	DashboardCashFlowChartItem,
	DashboardCashFlowRow,
} from "../schemas/model";
import type { DashboardMonthRange } from "../utils/period";
import {
	addMonths,
	createMonthStart,
	formatMonthShortYearLabel,
	getMonthKey,
} from "../utils/period";

interface RevenueTypeAmountTotals {
	administrative: Prisma.Decimal;
	judicial: Prisma.Decimal;
	succumbency: Prisma.Decimal;
}

function createRevenueTypeAmountTotals(): RevenueTypeAmountTotals {
	return {
		administrative: new Prisma.Decimal(0),
		judicial: new Prisma.Decimal(0),
		succumbency: new Prisma.Decimal(0),
	};
}

function pushRevenueTypeAmount(
	totals: RevenueTypeAmountTotals,
	revenueTypeValue: string,
	amount: Prisma.Decimal,
) {
	if (revenueTypeValue === "ADMINISTRATIVE") {
		totals.administrative = totals.administrative.add(amount);
		return;
	}

	if (revenueTypeValue === "JUDICIAL") {
		totals.judicial = totals.judicial.add(amount);
		return;
	}

	if (revenueTypeValue === "SUCCUMBENCY") {
		totals.succumbency = totals.succumbency.add(amount);
	}
}

export function buildMonthlyCashFlow({
	chartDownPayments,
	chartFees,
	chartRemunerations,
	chartExpenses,
	range,
}: {
	chartDownPayments: Array<{
		downPaymentValue: Prisma.Decimal | null;
		paymentStartDate: Date;
		type: {
			value: string;
		};
	}>;
	chartFees: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
		revenue: {
			type: {
				value: string;
			};
		};
	}>;
	chartRemunerations: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
	}>;
	chartExpenses: Array<{
		amount: Prisma.Decimal;
		expenseDate: Date;
	}>;
	range: DashboardMonthRange;
}): {
	chart: DashboardCashFlowChartItem[];
	table: DashboardCashFlowRow[];
} {
	const buckets = new Map<
		string,
		{
			month: string;
			monthLabel: string;
			entryTypes: RevenueTypeAmountTotals;
			remuneration: Prisma.Decimal;
			expense: Prisma.Decimal;
		}
	>();

	for (
		let current = range.startMonth;
		current.getTime() <= range.endMonth.getTime();
		current = addMonths(current, 1)
	) {
		const monthKey = getMonthKey(current);
		buckets.set(monthKey, {
			month: monthKey,
			monthLabel: formatMonthShortYearLabel(current),
			entryTypes: createRevenueTypeAmountTotals(),
			remuneration: new Prisma.Decimal(0),
			expense: new Prisma.Decimal(0),
		});
	}

	for (const row of chartDownPayments) {
		const month = getMonthKey(createMonthStart(row.paymentStartDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		pushRevenueTypeAmount(
			bucket.entryTypes,
			row.type.value,
			new Prisma.Decimal(row.downPaymentValue?.toString() ?? 0),
		);
	}

	for (const row of chartFees) {
		const month = getMonthKey(createMonthStart(row.paymentDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		pushRevenueTypeAmount(
			bucket.entryTypes,
			row.revenue.type.value,
			row.amount,
		);
	}

	for (const row of chartRemunerations) {
		const month = getMonthKey(createMonthStart(row.paymentDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		bucket.remuneration = bucket.remuneration.add(row.amount);
	}

	for (const row of chartExpenses) {
		const month = getMonthKey(createMonthStart(row.expenseDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		bucket.expense = bucket.expense.add(row.amount);
	}

	const table = Array.from(buckets.values()).map((bucket) => {
		const administrative = Number(bucket.entryTypes.administrative);
		const judicial = Number(bucket.entryTypes.judicial);
		const succumbency = Number(bucket.entryTypes.succumbency);
		const entryTotal = bucket.entryTypes.administrative
			.add(bucket.entryTypes.judicial)
			.add(bucket.entryTypes.succumbency);
		const entry = Number(entryTotal);
		const remuneration = Number(bucket.remuneration);
		const expense = Number(bucket.expense);
		const output = expense;
		const balance = Number(entryTotal.minus(bucket.expense));

		return {
			month: bucket.month,
			monthLabel: bucket.monthLabel,
			administrative,
			judicial,
			succumbency,
			entry,
			remuneration,
			expense,
			output,
			balance,
		};
	});

	return {
		chart: table.map((row) => ({
			month: row.month,
			entry: row.entry,
			output: row.output,
			balance: row.balance,
		})),
		table,
	};
}
