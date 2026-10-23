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
) {
	const reference = new Date(
		Math.min((period.dateTo ?? new Date()).getTime(), Date.now()),
	);
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
			value: client,
			total: getRevenueReceived(revenue, period),
		});
		for (const item of buildRevenueSchedule(revenue, reference)) {
			const days = Math.ceil(
				(item.dueDate.getTime() - reference.getTime()) / 86400000,
			);
			if (item.outstanding.lte(0)) {
				continue;
			}
			if (days < 0) {
				const age = -days;
				const label =
					age <= 30
						? "Até 30 dias"
						: age <= 60
							? "31–60 dias"
							: age <= 90
								? "61–90 dias"
								: "Acima de 90 dias";
				pushGroupTotal(aging, { label, value: label, total: item.outstanding });
			} else if (days <= 90) {
				const label =
					days <= 30
						? "Próximos 30 dias"
						: days <= 60
							? "31–60 dias"
							: "61–90 dias";
				pushGroupTotal(forecast, {
					label,
					value: label,
					total: item.outstanding,
				});
			}
		}
	}
	const total = (groups: Map<string, GroupTotal>) =>
		Array.from(groups.values()).reduce(
			(sum, item) => sum.add(item.total),
			new Prisma.Decimal(0),
		);
	return {
		referenceLabel: formatter.date(reference.toISOString()),
		overdueTotal: formatter.currency(Number(total(aging))),
		aging: mapBreakdown(aging, total(aging)),
		forecast: mapBreakdown(forecast, total(forecast)),
		clients: mapBreakdown(clients, total(clients)),
	};
}
