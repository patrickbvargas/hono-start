import { CalendarIcon } from "lucide-react";
import * as React from "react";
import {
	DateInput,
	DatePicker as DatePickerField,
	DateSegment,
	Group,
	I18nProvider,
} from "react-aria-components";
import { cn } from "@/shared/lib/utils";
import { inputVariants } from "../ui/input";
import {
	InputGroupAddon,
	InputGroupButton,
	inputGroupVariants,
} from "../ui/input-group";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps
	extends React.ComponentPropsWithoutRef<typeof DatePickerField> {
	calendarProps?: React.ComponentProps<typeof Calendar>;
}

function DatePicker({
	granularity = "day",
	shouldForceLeadingZeros = true,
	isInvalid,
	isDisabled,
	className,
	calendarProps,
	...props
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<I18nProvider locale="pt-BR-u-ca-gregory">
			<DatePickerField
				isDisabled={isDisabled}
				isInvalid={isInvalid}
				granularity={granularity}
				shouldForceLeadingZeros={shouldForceLeadingZeros}
				{...props}
				onChange={(value) => {
					props.onChange?.(value);
					setOpen(false);
				}}
			>
				<Group
					aria-invalid={isInvalid}
					className={cn(inputGroupVariants(), className)}
				>
					<DateInput
						className={cn(
							inputVariants(),
							"flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent text-center flex items-center",
						)}
					>
						{(segment) => (
							<DateSegment
								segment={segment}
								className="odd:px-1 rounded-sm focus:ring-0 focus:outline-0 focus:bg-muted"
							/>
						)}
					</DateInput>
					<InputGroupAddon align="inline-end">
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger
								render={
									<InputGroupButton
										variant="ghost"
										size="icon-xs"
										aria-label="Selecionar data"
									>
										<CalendarIcon />
										<span className="sr-only">Selecionar data</span>
									</InputGroupButton>
								}
							/>
							<PopoverContent className="w-auto p-0" align="end">
								<Calendar {...calendarProps} />
							</PopoverContent>
						</Popover>
					</InputGroupAddon>
				</Group>
			</DatePickerField>
		</I18nProvider>
	);
}

export { DatePicker };
