import { Temporal } from "@js-temporal/polyfill";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import type { FieldCommonProps } from "./types";
import { FormDescription, FormError, FormField, FormLabel } from "./utils";

interface FormDatePickerProps
	extends FieldCommonProps,
		Pick<React.ComponentProps<typeof Calendar>, "startMonth" | "endMonth"> {
	placeholder?: string;
}

export const FormDatePicker = ({
	label,
	description,
	isRequired,
	isDisabled,
	startMonth = new Date(2020, 0),
	endMonth = new Date(2035, 11),
	placeholder = "Selecionar uma data",
	classNames,
	...props
}: FormDatePickerProps) => {
	const [open, setOpen] = React.useState(false);
	const field = useFieldContext<Temporal.PlainDate | undefined>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FormField data-invalid={isInvalid} className={classNames?.wrapper}>
			<FormLabel
				label={label}
				htmlFor={field.name}
				isRequired={isRequired}
				className={classNames?.label}
			/>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger>
					<Button
						variant="outline"
						disabled={isDisabled}
						className="justify-start font-normal"
					>
						{field.state.value ? (
							String(field.state.value) // TODO: format
						) : (
							<span>{placeholder}</span>
						)}
						<CalendarIcon size={16} className="ml-auto opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={
							field.state.value
								? temporalToDate(field.state.value)
								: field.state.value
						}
						onSelect={(v) => {
							v ? field.handleChange(dateToTemporal(v)) : field.clearValues();
						}}
						startMonth={startMonth}
						endMonth={endMonth}
						disabled={isDisabled}
						{...props}
					/>
				</PopoverContent>
			</Popover>
			<FormDescription
				description={description}
				className={classNames?.description}
			/>
			<FormError
				errors={field.state.meta.errors}
				className={classNames?.error}
			/>
		</FormField>
	);
};

const temporalToDate = (plainDate: Temporal.PlainDate): Date =>
	new Date(plainDate.year, plainDate.month - 1, plainDate.day);

const dateToTemporal = (date: Date): Temporal.PlainDate =>
	Temporal.PlainDate.from({
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
	});
