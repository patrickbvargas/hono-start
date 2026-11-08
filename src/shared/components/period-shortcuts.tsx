import { Button, DateRangePicker } from "@/shared/components/ui";

export type PeriodShortcutId =
	| "all"
	| "currentMonth"
	| "lastMonth"
	| "last3Months"
	| "last6Months"
	| "last12Months"
	| "currentYear";

export interface PeriodShortcutOption {
	id: string;
	label: string;
	getRange: (referenceDate?: Date) => { dateFrom: string; dateTo: string };
}

export type PeriodPresetInput = PeriodShortcutId | PeriodShortcutOption;

function createUtcDate(year: number, month: number, day: number): Date {
	return new Date(Date.UTC(year, month, day));
}

function getUtcDateOnly(referenceDate = new Date()): Date {
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

export function getMonthRange(now = new Date()) {
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const last = new Date(year, now.getMonth() + 1, 0).getDate();
	return {
		dateFrom: `${year}-${month}-01`,
		dateTo: `${year}-${month}-${last}`,
	};
}

export function getCurrentYearRange(referenceDate = new Date()) {
	const today = getUtcDateOnly(referenceDate);
	const currentYear = today.getUTCFullYear();
	return {
		dateFrom: `${currentYear}-01-01`,
		dateTo: formatUtcDate(today),
	};
}

export const PERIOD_PRESETS: Record<PeriodShortcutId, PeriodShortcutOption> = {
	all: {
		id: "all",
		label: "Todo período",
		getRange: () => ({ dateFrom: "", dateTo: "" }),
	},
	currentMonth: {
		id: "currentMonth",
		label: "Este mês",
		getRange: (now = new Date()) => getMonthRange(now),
	},
	lastMonth: {
		id: "lastMonth",
		label: "Mês anterior",
		getRange: (now = new Date()) => {
			const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, "0");
			const last = new Date(year, d.getMonth() + 1, 0).getDate();
			return {
				dateFrom: `${year}-${month}-01`,
				dateTo: `${year}-${month}-${last}`,
			};
		},
	},
	last3Months: {
		id: "last3Months",
		label: "3 meses",
		getRange: (referenceDate = new Date()) => {
			const today = getUtcDateOnly(referenceDate);
			return {
				dateFrom: formatUtcDate(addUtcMonths(today, -2)),
				dateTo: formatUtcDate(today),
			};
		},
	},
	last6Months: {
		id: "last6Months",
		label: "6 meses",
		getRange: (referenceDate = new Date()) => {
			const today = getUtcDateOnly(referenceDate);
			return {
				dateFrom: formatUtcDate(addUtcMonths(today, -5)),
				dateTo: formatUtcDate(today),
			};
		},
	},
	last12Months: {
		id: "last12Months",
		label: "12 meses",
		getRange: (referenceDate = new Date()) => {
			const today = getUtcDateOnly(referenceDate);
			return {
				dateFrom: formatUtcDate(addUtcMonths(today, -11)),
				dateTo: formatUtcDate(today),
			};
		},
	},
	currentYear: {
		id: "currentYear",
		label: "Este ano",
		getRange: (referenceDate = new Date()) =>
			getCurrentYearRange(referenceDate),
	},
};

export interface PeriodShortcutsProps {
	dateFrom?: string;
	dateTo?: string;
	onChange: (range: { dateFrom: string; dateTo: string }) => void;
	presets?: PeriodPresetInput[];
	label?: string;
	showCustom?: boolean;
	customTriggerLabel?: string;
	className?: string;
}

export function PeriodShortcuts({
	dateFrom = "",
	dateTo = "",
	onChange,
	presets = ["all", "currentMonth"],
	label = "Período",
	showCustom = true,
	customTriggerLabel = "Personalizado",
	className = "flex shrink-0 items-center gap-2 whitespace-nowrap",
}: PeriodShortcutsProps) {
	const resolvedPresets = presets.map((preset) =>
		typeof preset === "string" ? PERIOD_PRESETS[preset] : preset,
	);

	const activePreset = resolvedPresets.find((preset) => {
		const range = preset.getRange();
		if (preset.id === "all") {
			return !dateFrom && !dateTo;
		}
		return dateFrom === range.dateFrom && dateTo === range.dateTo;
	});

	const isCustomActive = Boolean(dateFrom || dateTo) && !activePreset;

	return (
		<div role="group" aria-label="Atalhos de período" className={className}>
			{label ? (
				<span className="text-xs text-muted-foreground">{label}</span>
			) : null}
			{resolvedPresets.map((preset) => {
				const isActive = activePreset?.id === preset.id;

				return (
					<Button
						key={preset.id}
						type="button"
						size="sm"
						variant={isActive ? "secondary" : "ghost"}
						aria-pressed={isActive}
						onClick={() => onChange(preset.getRange())}
					>
						{preset.label}
					</Button>
				);
			})}
			{showCustom ? (
				<DateRangePicker
					label="Período personalizado"
					triggerLabel={customTriggerLabel}
					isActive={isCustomActive}
					dateFrom={dateFrom}
					dateTo={dateTo}
					onChange={onChange}
				/>
			) : null}
		</div>
	);
}
