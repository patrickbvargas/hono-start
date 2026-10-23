import type { Prisma } from "@/generated/prisma/client";
import type { DashboardFinancialEvolutionItem } from "../schemas/model";
import type { DashboardMonthRange } from "../utils/period";
import { addMonths, createMonthStart, getMonthKey } from "../utils/period";

export function buildMonthlyFinancialEvolution({
	chartDownPayments,
	chartFees,
	chartRemunerations,
	range,
}: {
	chartDownPayments: Array<{
		downPaymentValue: Prisma.Decimal | null;
		paymentStartDate: Date;
	}>;
	chartFees: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
	}>;
	chartRemunerations: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
	}>;
	range: DashboardMonthRange;
}): DashboardFinancialEvolutionItem[] {
	const buckets = new Map<string, DashboardFinancialEvolutionItem>();

	for (
		let current = range.startMonth;
		current.getTime() <= range.endMonth.getTime();
		current = addMonths(current, 1)
	) {
		buckets.set(getMonthKey(current), {
			month: getMonthKey(current),
			revenue: 0,
			remuneration: 0,
		});
	}

	for (const row of chartDownPayments) {
		const month = getMonthKey(createMonthStart(row.paymentStartDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		bucket.revenue += Number(row.downPaymentValue?.toString() ?? 0);
	}

	for (const row of chartFees) {
		const month = getMonthKey(createMonthStart(row.paymentDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		bucket.revenue += Number(row.amount);
	}

	for (const row of chartRemunerations) {
		const month = getMonthKey(createMonthStart(row.paymentDate));
		const bucket = buckets.get(month);

		if (!bucket) {
			continue;
		}

		bucket.remuneration += Number(row.amount);
	}

	return Array.from(buckets.values());
}
