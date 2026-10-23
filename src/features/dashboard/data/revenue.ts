import { Prisma } from "@/generated/prisma/client";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardPeriod } from "../utils/period";
import { isDateInsidePeriod } from "../utils/period";

export interface RevenueRow {
	id: number;
	totalValue: Prisma.Decimal;
	downPaymentValue: Prisma.Decimal | null;
	paymentStartDate: Date;
	totalInstallments: number;
	type: {
		label: string;
		value: string;
	};
	contract: {
		processNumber: string;
		client: {
			id: number;
			fullName: string;
		};
		legalArea: {
			label: string;
			value: string;
		};
		assignments: Array<{
			employee: {
				fullName: string;
			};
			assignmentType: {
				value: string;
			};
		}>;
	};
	fees: Array<{
		amount: Prisma.Decimal;
		paymentDate: Date;
		installmentNumber: number;
	}>;
}

export interface GroupTotal {
	label: string;
	value: string;
	total: Prisma.Decimal;
}

export function sumDecimal(values: Prisma.Decimal[]): Prisma.Decimal {
	return values.reduce(
		(total, value) => total.add(value),
		new Prisma.Decimal(0),
	);
}

export function calculateChangePercent(
	currentValue: Prisma.Decimal,
	previousValue: Prisma.Decimal,
): number | null {
	if (previousValue.equals(0)) {
		if (currentValue.equals(0)) {
			return 0;
		}

		return null;
	}

	return Number(
		currentValue.minus(previousValue).div(previousValue.abs()).mul(100),
	);
}

export function pushGroupTotal(
	groups: Map<string, GroupTotal>,
	item: GroupTotal,
) {
	const existing = groups.get(item.value);

	if (existing) {
		existing.total = existing.total.add(item.total);
		return;
	}

	groups.set(item.value, item);
}

export function mapBreakdown(
	groups: Map<string, GroupTotal>,
	total: Prisma.Decimal,
) {
	return Array.from(groups.values())
		.sort((first, second) => Number(second.total.minus(first.total)))
		.map((item) => ({
			label: item.label,
			value: item.value,
			total: Number(item.total),
			formattedTotal: formatter.currency(Number(item.total)),
			percentage: total.equals(0) ? 0 : Number(item.total.div(total).mul(100)),
		}));
}

export function getRevenueReceived(
	revenue: RevenueRow,
	period: DashboardPeriod,
): Prisma.Decimal {
	const downPayment = isDateInsidePeriod(revenue.paymentStartDate, period)
		? new Prisma.Decimal(revenue.downPaymentValue?.toString() ?? 0)
		: new Prisma.Decimal(0);

	return revenue.fees.reduce(
		(total, fee) =>
			isDateInsidePeriod(fee.paymentDate, period)
				? total.add(fee.amount)
				: total,
		downPayment,
	);
}
