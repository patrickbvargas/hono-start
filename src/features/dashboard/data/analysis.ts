import type { DashboardPeriod } from "../utils/period";

export function getFinancialReferenceDate(period: DashboardPeriod): Date {
	const today = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
	const lastDay = period.dateTo?.toISOString().slice(0, 10);
	return new Date(
		`${lastDay && lastDay < today ? lastDay : today}T23:59:59.999Z`,
	);
}

export function getInstallmentBucket(
	dueDate: Date,
	reference: Date,
): { kind: "aging" | "forecast"; value: string } | null {
	const days = Math.round(
		(Date.parse(dueDate.toISOString().slice(0, 10)) -
			Date.parse(reference.toISOString().slice(0, 10))) /
			86400000,
	);
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
