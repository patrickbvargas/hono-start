export type FinancialPeriodShortcutId =
	| "last6Months"
	| "last12Months"
	| "currentMonth"
	| "currentYear";

export interface FinancialPeriodShortcut {
	id: FinancialPeriodShortcutId;
	label: string;
	dateFrom: string;
	dateTo: string;
}

interface FinancialPeriodSelection {
	dateFrom?: string;
	dateTo?: string;
}

function createUtcDate(year: number, month: number, day: number): Date {
	return new Date(Date.UTC(year, month, day));
}

function getUtcDateOnly(referenceDate: Date): Date {
	const day = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(referenceDate);
	return new Date(`${day}T00:00:00Z`);
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
): Pick<FinancialPeriodShortcut, "dateFrom" | "dateTo"> {
	const today = getUtcDateOnly(referenceDate);
	const currentYear = today.getUTCFullYear();

	return {
		dateFrom: `${currentYear}-01-01`,
		dateTo: formatUtcDate(today),
	};
}

export function getFinancialPeriodShortcuts(
	referenceDate = new Date(),
): FinancialPeriodShortcut[] {
	const today = getUtcDateOnly(referenceDate);
	const currentYear = today.getUTCFullYear();
	const currentYearRange = getCurrentYearDateRange(referenceDate);

	return [
		{
			id: "last6Months",
			label: "6 meses",
			dateFrom: formatUtcDate(addUtcMonths(today, -5)),
			dateTo: formatUtcDate(today),
		},
		{
			id: "last12Months",
			label: "12 meses",
			dateFrom: formatUtcDate(addUtcMonths(today, -11)),
			dateTo: formatUtcDate(today),
		},
		{
			id: "currentMonth",
			label: "Este mês",
			dateFrom: formatUtcDate(
				createUtcDate(currentYear, today.getUTCMonth(), 1),
			),
			dateTo: formatUtcDate(
				createUtcDate(currentYear, today.getUTCMonth() + 1, 0),
			),
		},
		{
			id: "currentYear",
			label: "Este ano",
			dateFrom: currentYearRange.dateFrom,
			dateTo: currentYearRange.dateTo,
		},
	];
}

export function getFinancialPeriodShortcutById(
	shortcutId: FinancialPeriodShortcutId,
	referenceDate = new Date(),
): FinancialPeriodShortcut {
	const shortcut = getFinancialPeriodShortcuts(referenceDate).find(
		(item) => item.id === shortcutId,
	);

	if (!shortcut) {
		throw new Error(`Unknown financial period shortcut: ${shortcutId}`);
	}

	return shortcut;
}

export function getFinancialActivePeriodShortcut(
	selection: FinancialPeriodSelection,
	referenceDate = new Date(),
): FinancialPeriodShortcutId | null {
	if (!selection.dateFrom || !selection.dateTo) {
		return null;
	}

	const matchedShortcut = getFinancialPeriodShortcuts(referenceDate).find(
		(shortcut) =>
			shortcut.dateFrom === selection.dateFrom &&
			shortcut.dateTo === selection.dateTo,
	);

	return matchedShortcut?.id ?? null;
}
