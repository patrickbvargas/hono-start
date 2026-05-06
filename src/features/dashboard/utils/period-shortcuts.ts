export type DashboardPeriodShortcutId =
	| "last6Months"
	| "last12Months"
	| "currentYear";

export interface DashboardPeriodShortcut {
	id: DashboardPeriodShortcutId;
	label: string;
	dateFrom: string;
	dateTo: string;
}

interface DashboardPeriodSelection {
	dateFrom: string;
	dateTo: string;
}

function createUtcDate(year: number, month: number, day: number): Date {
	return new Date(Date.UTC(year, month, day));
}

function getUtcDateOnly(referenceDate: Date): Date {
	return createUtcDate(
		referenceDate.getUTCFullYear(),
		referenceDate.getUTCMonth(),
		referenceDate.getUTCDate(),
	);
}

function addUtcMonths(referenceDate: Date, months: number): Date {
	return createUtcDate(
		referenceDate.getUTCFullYear(),
		referenceDate.getUTCMonth() + months,
		referenceDate.getUTCDate(),
	);
}

function formatUtcDate(referenceDate: Date): string {
	return referenceDate.toISOString().slice(0, 10);
}

export function getCurrentYearDateRange(
	referenceDate = new Date(),
): Pick<DashboardPeriodShortcut, "dateFrom" | "dateTo"> {
	const currentYear = referenceDate.getUTCFullYear();
	const today = getUtcDateOnly(referenceDate);

	return {
		dateFrom: `${currentYear}-01-01`,
		dateTo: formatUtcDate(today),
	};
}

export function getDashboardPeriodShortcuts(
	referenceDate = new Date(),
): DashboardPeriodShortcut[] {
	const today = getUtcDateOnly(referenceDate);
	const currentYear = referenceDate.getUTCFullYear();
	const currentYearRange = getCurrentYearDateRange(referenceDate);

	return [
		{
			id: "last6Months",
			label: "6M",
			dateFrom: formatUtcDate(addUtcMonths(today, -5)),
			dateTo: formatUtcDate(today),
		},
		{
			id: "last12Months",
			label: "12M",
			dateFrom: formatUtcDate(addUtcMonths(today, -11)),
			dateTo: formatUtcDate(today),
		},
		{
			id: "currentYear",
			label: `${currentYear}`,
			dateFrom: currentYearRange.dateFrom,
			dateTo: currentYearRange.dateTo,
		},
	];
}

export function getDashboardPeriodShortcutById(
	shortcutId: DashboardPeriodShortcutId,
	referenceDate = new Date(),
): DashboardPeriodShortcut {
	const shortcut = getDashboardPeriodShortcuts(referenceDate).find(
		(item) => item.id === shortcutId,
	);

	if (!shortcut) {
		throw new Error(`Unknown dashboard period shortcut: ${shortcutId}`);
	}

	return shortcut;
}

export function getDashboardActivePeriodShortcut(
	selection: DashboardPeriodSelection,
	referenceDate = new Date(),
): DashboardPeriodShortcutId | null {
	const matchedShortcut = getDashboardPeriodShortcuts(referenceDate).find(
		(shortcut) =>
			shortcut.dateFrom === selection.dateFrom &&
			shortcut.dateTo === selection.dateTo,
	);

	return matchedShortcut?.id ?? null;
}
