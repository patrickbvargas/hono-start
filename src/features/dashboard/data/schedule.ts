import { Prisma } from "@/generated/prisma/client";
import {
	addMonthsPreservingDay,
	type DashboardPeriod,
	isDateInsidePeriod,
} from "../utils/period";
import type { RevenueRow } from "./revenue";

export function buildRevenueSchedule(revenue: RevenueRow, referenceDate: Date) {
	const principal = new Prisma.Decimal(revenue.totalValue).minus(
		revenue.downPaymentValue ?? 0,
	);
	const regular = principal.div(revenue.totalInstallments).toDecimalPlaces(2);
	return Array.from({ length: revenue.totalInstallments }, (_, index) => {
		const installmentNumber = index + 1;
		const amount =
			installmentNumber === revenue.totalInstallments
				? principal.minus(regular.mul(index))
				: regular;
		const paid = revenue.fees
			.filter(
				(fee) =>
					fee.installmentNumber === installmentNumber &&
					fee.paymentDate <= referenceDate,
			)
			.reduce((total, fee) => total.add(fee.amount), new Prisma.Decimal(0));
		return {
			installmentNumber,
			dueDate: addMonthsPreservingDay(
				revenue.paymentStartDate,
				installmentNumber,
			),
			amount,
			outstanding: Prisma.Decimal.max(0, amount.minus(paid)),
		};
	});
}

export function getScheduledRevenue(
	revenues: RevenueRow[],
	period: DashboardPeriod,
) {
	return revenues.reduce((total, revenue) => {
		const downPayment = isDateInsidePeriod(revenue.paymentStartDate, period)
			? new Prisma.Decimal(revenue.downPaymentValue ?? 0)
			: new Prisma.Decimal(0);
		return buildRevenueSchedule(revenue, new Date()).reduce(
			(sum, item) =>
				isDateInsidePeriod(item.dueDate, period) ? sum.add(item.amount) : sum,
			total.add(downPayment),
		);
	}, new Prisma.Decimal(0));
}
