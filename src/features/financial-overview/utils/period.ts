import { Prisma } from "@/generated/prisma/client";
import type { FinancialOverviewSearch } from "../schemas/search";

export interface ComparisonBoundaries {
	currentStart: Date;
	nextStart: Date;
	previousStart: Date;
	previousEndExclusive: Date;
	previousLabel: string;
	previousPeriodLabel: string;
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

function addYears(value: Date, years: number): Date {
	const next = new Date(value);
	next.setUTCFullYear(next.getUTCFullYear() + years);
	return next;
}

function formatDateRangeLabel(start: Date, endInclusive: Date): string {
	const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
		timeZone: "UTC",
	});

	return `${dateFormatter.format(start)} a ${dateFormatter.format(endInclusive)}`;
}

export function getComparisonBoundaries(
	search: FinancialOverviewSearch,
): ComparisonBoundaries {
	const now = new Date();
	const dateFrom = search.dateFrom
		? createDayStart(search.dateFrom)
		: undefined;
	const dateTo = search.dateTo ? createDayEnd(search.dateTo) : undefined;
	const hasPeriod = Boolean(dateFrom || dateTo);

	if (!hasPeriod) {
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
		dateFrom ??
		new Date(
			dateTo?.getUTCFullYear() ?? now.getUTCFullYear(),
			dateTo?.getUTCMonth() ?? now.getUTCMonth(),
			1,
		);
	const inclusiveEnd = dateTo ?? createDayEnd(now.toISOString().slice(0, 10));
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

export function calculateChangePercent(
	currentValue: Prisma.Decimal | number,
	previousValue: Prisma.Decimal | number,
): number | null {
	const curr =
		typeof currentValue === "number"
			? new Prisma.Decimal(currentValue)
			: currentValue;
	const prev =
		typeof previousValue === "number"
			? new Prisma.Decimal(previousValue)
			: previousValue;

	if (prev.equals(0)) {
		if (curr.equals(0)) {
			return 0;
		}
		return null;
	}

	return Number(curr.minus(prev).div(prev.abs()).mul(100).toFixed(1));
}
