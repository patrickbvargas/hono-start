import { Prisma } from "@/generated/prisma/client";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardPeriod } from "../utils/period";
import {
	type GroupTotal,
	getRevenueReceived,
	mapBreakdown,
	pushGroupTotal,
	type RevenueRow,
} from "./revenue";
import { buildRevenueSchedule } from "./schedule";

export function buildFinancialAnalysis(
	revenues: RevenueRow[],
	period: DashboardPeriod,
	reference = getFinancialReferenceDate(period),
) {
	const aging = new Map<string, GroupTotal>();
	const forecast = new Map<string, GroupTotal>();
	const clients = new Map<string, GroupTotal>();
	for (const label of [
		"Até 30 dias",
		"31–60 dias",
		"61–90 dias",
		"Acima de 90 dias",
	])
		aging.set(label, { label, value: label, total: new Prisma.Decimal(0) });
	for (const label of ["Próximos 30 dias", "31–60 dias", "61–90 dias"])
		forecast.set(label, { label, value: label, total: new Prisma.Decimal(0) });
	for (const revenue of revenues) {
		const client = revenue.contract.client.fullName;
		pushGroupTotal(clients, {
			label: client,
			value: String(revenue.contract.client.id),
			total: getRevenueReceived(revenue, period),
		});
		for (const item of buildRevenueSchedule(revenue, reference)) {
			const bucket = getInstallmentBucket(item.dueDate, reference);
			if (item.outstanding.lte(0) || !bucket) {
				continue;
			}
			pushGroupTotal(bucket.kind === "aging" ? aging : forecast, {
				label: bucket.value,
				value: bucket.value,
				total: item.outstanding,
			});
		}
	}
	const total = (groups: Map<string, GroupTotal>) =>
		Array.from(groups.values()).reduce(
			(sum, item) => sum.add(item.total),
			new Prisma.Decimal(0),
		);
	return {
		referenceAt: reference.toISOString(),
		referenceLabel: formatter.date(reference.toISOString()),
		overdueTotal: formatter.currency(Number(total(aging))),
		aging: mapBreakdown(aging, total(aging)).sort(
			(a, b) =>
				[...aging.keys()].indexOf(a.value) - [...aging.keys()].indexOf(b.value),
		),
		forecast: mapBreakdown(forecast, total(forecast)).sort(
			(a, b) =>
				[...forecast.keys()].indexOf(a.value) -
				[...forecast.keys()].indexOf(b.value),
		),
		clients: mapBreakdown(clients, total(clients)),
	};
}

export function getFinancialReferenceDate(period: DashboardPeriod): Date {
	return new Date(
		Math.min((period.dateTo ?? new Date()).getTime(), Date.now()),
	);
}

export function getInstallmentBucket(
	dueDate: Date,
	reference: Date,
): { kind: "aging" | "forecast"; value: string } | null {
	const days = Math.ceil((dueDate.getTime() - reference.getTime()) / 86400000);
	if (days < 0) {
		const age = -days;
		return {
			kind: "aging",
			value:
				age <= 30
					? "Até 30 dias"
					: age <= 60
						? "31–60 dias"
						: age <= 90
							? "61–90 dias"
							: "Acima de 90 dias",
		};
	}
	if (days > 90) {
		return null;
	}
	return {
		kind: "forecast",
		value:
			days <= 30
				? "Próximos 30 dias"
				: days <= 60
					? "31–60 dias"
					: "61–90 dias",
	};
}
