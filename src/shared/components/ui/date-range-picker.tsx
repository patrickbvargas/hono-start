import { parseDate } from "@internationalized/date";
import { CalendarIcon } from "lucide-react";
import { useId, useState } from "react";
import { I18nProvider } from "react-aria-components";
import { cn } from "@/shared/lib/utils";
import { Button } from "./button";
import { RangeCalendar } from "./calendar";
import { FieldWrapper } from "./field";
import { inputVariants } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DateRangePickerProps {
	label: string;
	dateFrom: string;
	dateTo: string;
	triggerLabel?: string;
	isActive?: boolean;
	onChange: (range: { dateFrom: string; dateTo: string }) => void;
}

function DateRangePicker({
	label,
	dateFrom,
	dateTo,
	triggerLabel,
	isActive,
	onChange,
}: DateRangePickerProps) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const format = (date: string) => date.split("-").reverse().join("/");
	const text =
		dateFrom && dateTo
			? `${format(dateFrom)} – ${format(dateTo)}`
			: dateFrom
				? `De ${format(dateFrom)}`
				: dateTo
					? `Até ${format(dateTo)}`
					: "Selecionar período";
	const picker = (
		<I18nProvider locale="pt-BR-u-ca-gregory">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					render={
						triggerLabel ? (
							<Button
								id={id}
								type="button"
								size="sm"
								variant={isActive ? "secondary" : "ghost"}
								aria-pressed={isActive}
								title={dateFrom || dateTo ? text : undefined}
							/>
						) : (
							<button
								id={id}
								type="button"
								className={cn(
									inputVariants(),
									"flex items-center justify-between gap-2 whitespace-nowrap text-left",
									!dateFrom && !dateTo && "text-muted-foreground",
								)}
							/>
						)
					}
				>
					<span>{triggerLabel ?? text}</span>
					{!triggerLabel && (
						<CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
					)}
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<RangeCalendar
						aria-label={label}
						value={
							dateFrom && dateTo
								? { start: parseDate(dateFrom), end: parseDate(dateTo) }
								: null
						}
						defaultFocusedValue={
							dateFrom || dateTo ? parseDate(dateFrom || dateTo) : undefined
						}
						onChange={(range) => {
							onChange({
								dateFrom: range.start.toString(),
								dateTo: range.end.toString(),
							});
							setOpen(false);
						}}
					/>
					<div className="border-t p-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							disabled={!dateFrom && !dateTo}
							onClick={() => {
								onChange({ dateFrom: "", dateTo: "" });
								setOpen(false);
							}}
						>
							Limpar período
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</I18nProvider>
	);
	return triggerLabel ? (
		picker
	) : (
		<FieldWrapper id={id} label={label}>
			{picker}
		</FieldWrapper>
	);
}

export { DateRangePicker };
