import type { Prisma } from "@/generated/prisma/client";
import type { DashboardSearch } from "../schemas/search";

export interface DashboardPeriod {
	dateFrom?: Date;
	dateTo?: Date;
	hasPeriod: boolean;
}

export interface DashboardMonthRange {
	endMonth: Date;
	label: string;
	startMonth: Date;
}

interface ComparisonBoundaries {
	currentStart: Date;
	nextStart: Date;
	previousEndExclusive: Date;
	previousPeriodLabel: string;
	previousStart: Date;
	previousLabel: string;
}

function createDayStart(value: string): Date {
	return new Date(`${value}T00:00:00.000Z`);
}

function createDayEnd(value: string): Date {
	return new Date(`${value}T23:59:59.999Z`);
}

function addDays(value: Date, days: number): Date {
	const next = new Date(value);
	next.setUTCDate(next.getUTCDate() + days);
	return next;
}

export function createMonthStart(value: Date): Date {
	return new Date(
		Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1, 0, 0, 0, 0),
	);
}

export function createMonthEnd(value: Date): Date {
	return new Date(
		Date.UTC(
			value.getUTCFullYear(),
			value.getUTCMonth() + 1,
			0,
			23,
			59,
			59,
			999,
		),
	);
}

export function addMonths(value: Date, months: number): Date {
	return new Date(
		Date.UTC(
			value.getUTCFullYear(),
			value.getUTCMonth() + months,
			1,
			0,
			0,
			0,
			0,
		),
	);
}

export function addMonthsPreservingDay(value: Date, months: number): Date {
	const shiftedYear = value.getUTCFullYear();
	const shiftedMonth = value.getUTCMonth() + months;
	const shiftedDay = value.getUTCDate();
	const lastDayOfTargetMonth = new Date(
		Date.UTC(shiftedYear, shiftedMonth + 1, 0),
	).getUTCDate();
	const safeDay = Math.min(shiftedDay, lastDayOfTargetMonth);

	return new Date(
		Date.UTC(
			shiftedYear,
			shiftedMonth,
			safeDay,
			value.getUTCHours(),
			value.getUTCMinutes(),
			value.getUTCSeconds(),
			value.getUTCMilliseconds(),
		),
	);
}

function addYears(value: Date, years: number): Date {
	const next = new Date(value);
	next.setUTCFullYear(next.getUTCFullYear() + years);
	return next;
}

export function getMonthKey(value: Date): string {
	return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthYearLabel(value: Date): string {
	const formatted = new Intl.DateTimeFormat("pt-BR", {
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	})
		.format(value)
		.replace(".", "");

	const [month, year] = formatted.split(" de ");

	if (!month || !year) {
		return formatted;
	}

	return `${month.charAt(0).toUpperCase()}${month.slice(1)}/${year}`;
}

export function formatMonthShortYearLabel(value: Date): string {
	const formatted = new Intl.DateTimeFormat("pt-BR", {
		month: "short",
		year: "2-digit",
		timeZone: "UTC",
	})
		.format(value)
		.replace(".", "");

	const [month, year] = formatted.split(" de ");

	if (!month || !year) {
		return formatted;
	}

	return `${month.charAt(0).toUpperCase()}${month.slice(1)}/${year}`;
}

function formatDateRangeLabel(start: Date, endInclusive: Date): string {
	const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
		timeZone: "UTC",
	});

	return `${dateFormatter.format(start)} a ${dateFormatter.format(endInclusive)}`;
}

export function getDashboardPeriod(search: DashboardSearch): DashboardPeriod {
	const dateFrom = search.dateFrom
		? createDayStart(search.dateFrom)
		: undefined;
	const dateTo = search.dateTo ? createDayEnd(search.dateTo) : undefined;

	return {
		dateFrom,
		dateTo,
		hasPeriod: Boolean(dateFrom || dateTo),
	};
}

export function buildDashboardPaymentDateWhere(
	period: DashboardPeriod,
): Prisma.DateTimeFilter | undefined {
	if (!period.hasPeriod) {
		return undefined;
	}

	return {
		...(period.dateFrom ? { gte: period.dateFrom } : {}),
		...(period.dateTo ? { lte: period.dateTo } : {}),
	};
}

export function isDateInsidePeriod(
	value: Date,
	period: DashboardPeriod,
): boolean {
	if (!period.hasPeriod) {
		return true;
	}

	if (period.dateFrom && value < period.dateFrom) {
		return false;
	}

	if (period.dateTo && value > period.dateTo) {
		return false;
	}

	return true;
}

export function isDateInsideRange(
	value: Date,
	start: Date,
	endExclusive: Date,
): boolean {
	return value >= start && value < endExclusive;
}

export function getComparisonBoundaries(
	search: DashboardSearch,
): ComparisonBoundaries {
	const now = new Date();
	const period = getDashboardPeriod(search);

	if (!period.hasPeriod) {
		const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const nextStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
		const previousStart = addYears(currentStart, -1);
		const previousEndExclusive = addYears(nextStart, -1);

		return {
			currentStart,
			nextStart,
			previousStart,
			previousEndExclusive,
			previousLabel: "Período anterior",
			previousPeriodLabel: formatDateRangeLabel(
				previousStart,
				addDays(previousEndExclusive, -1),
			),
		};
	}

	const currentStart =
		period.dateFrom ??
		new Date(
			period.dateTo?.getUTCFullYear() ?? now.getUTCFullYear(),
			period.dateTo?.getUTCMonth() ?? now.getUTCMonth(),
			1,
		);
	const inclusiveEnd =
		period.dateTo ?? createDayEnd(now.toISOString().slice(0, 10));
	const nextStart = addDays(
		createDayStart(inclusiveEnd.toISOString().slice(0, 10)),
		1,
	);
	const previousStart = addYears(currentStart, -1);
	const previousEndExclusive = addYears(nextStart, -1);

	return {
		currentStart,
		nextStart,
		previousStart,
		previousEndExclusive,
		previousLabel: "Período anterior",
		previousPeriodLabel: formatDateRangeLabel(
			previousStart,
			addDays(previousEndExclusive, -1),
		),
	};
}

export function getFinancialEvolutionMonthRange(
	search: DashboardSearch,
): DashboardMonthRange {
	const period = getDashboardPeriod(search);
	const referenceEnd = period.dateTo ?? new Date();

	if (period.dateFrom && period.dateTo) {
		return {
			startMonth: createMonthStart(period.dateFrom),
			endMonth: createMonthStart(period.dateTo),
			label: `${formatMonthYearLabel(createMonthStart(period.dateFrom))} a ${formatMonthYearLabel(createMonthStart(period.dateTo))}`,
		};
	}

	const fallbackStart = createMonthStart(
		period.dateFrom ?? addMonths(referenceEnd, -5),
	);
	const fallbackEnd = createMonthStart(period.dateTo ?? referenceEnd);

	return {
		startMonth: fallbackStart,
		endMonth: fallbackEnd,
		label: `${formatMonthYearLabel(fallbackStart)} a ${formatMonthYearLabel(fallbackEnd)}`,
	};
}
