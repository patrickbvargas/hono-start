import { Button, DateRangePicker } from "@/shared/components/ui";

interface FinancialPeriodShortcutsProps {
	dateFrom: string;
	dateTo: string;
	onChange: (range: { dateFrom: string; dateTo: string }) => void;
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
export function FinancialPeriodShortcuts({
	dateFrom,
	dateTo,
	onChange,
}: FinancialPeriodShortcutsProps) {
	const month = getMonthRange();
	return (
		<div
			role="group"
			aria-label="Atalhos de período"
			className="flex shrink-0 items-center gap-2 whitespace-nowrap"
		>
			<span className="text-xs text-muted-foreground">Período</span>
			<Button
				type="button"
				size="sm"
				variant={!dateFrom && !dateTo ? "secondary" : "ghost"}
				aria-pressed={!dateFrom && !dateTo}
				onClick={() => onChange({ dateFrom: "", dateTo: "" })}
			>
				Todo período
			</Button>
			<Button
				type="button"
				size="sm"
				variant={
					dateFrom === month.dateFrom && dateTo === month.dateTo
						? "secondary"
						: "ghost"
				}
				aria-pressed={dateFrom === month.dateFrom && dateTo === month.dateTo}
				onClick={() => onChange(month)}
			>
				Este mês
			</Button>
			<DateRangePicker
				label="Período personalizado"
				triggerLabel="Personalizado"
				isActive={
					Boolean(dateFrom || dateTo) &&
					!(dateFrom === month.dateFrom && dateTo === month.dateTo)
				}
				dateFrom={dateFrom}
				dateTo={dateTo}
				onChange={onChange}
			/>
		</div>
	);
}
