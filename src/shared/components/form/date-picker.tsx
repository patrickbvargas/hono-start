import type { DateValue } from "@internationalized/date";
import {
	Calendar,
	DateField,
	DatePicker,
	type DatePickerProps,
	Field,
} from "@/shared/components/hui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormDatePickerProps
	extends DatePickerProps<DateValue>,
		FieldCommonProps {}

export const FormDatePicker = ({
	label,
	description,
	validationBehavior = "aria",
	classNames,
	...props
}: FormDatePickerProps) => {
	const field = useFieldContext<DateValue | null>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<DatePicker
			name={field.name}
			isInvalid={isInvalid}
			value={field.state.value}
			onBlur={field.handleBlur}
			onChange={field.handleChange}
			validationBehavior={validationBehavior}
			className={classNames?.wrapper}
			{...props}
		>
			<Field.Label
				label={label}
				htmlFor={field.name}
				className={classNames?.label}
			/>

			<DateField.Group fullWidth>
				<DateField.Input>
					{(segment) => <DateField.Segment segment={segment} />}
				</DateField.Input>
				<DateField.Suffix>
					<DatePicker.Trigger>
						<DatePicker.TriggerIndicator />
					</DatePicker.Trigger>
				</DateField.Suffix>
			</DateField.Group>
			<DatePicker.Popover>
				<Calendar aria-label="Calendar Date">
					<Calendar.Header>
						<Calendar.YearPickerTrigger>
							<Calendar.YearPickerTriggerHeading />
							<Calendar.YearPickerTriggerIndicator />
						</Calendar.YearPickerTrigger>
						<Calendar.NavButton slot="previous" />
						<Calendar.NavButton slot="next" />
					</Calendar.Header>
					<Calendar.Grid>
						<Calendar.GridHeader>
							{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
						</Calendar.GridHeader>
						<Calendar.GridBody>
							{(date) => <Calendar.Cell date={date} />}
						</Calendar.GridBody>
					</Calendar.Grid>
					<Calendar.YearPickerGrid>
						<Calendar.YearPickerGridBody>
							{({ year }) => <Calendar.YearPickerCell year={year} />}
						</Calendar.YearPickerGridBody>
					</Calendar.YearPickerGrid>
				</Calendar>
			</DatePicker.Popover>
			{!isInvalid ? (
				<Field.Description
					description={description}
					className={classNames?.description}
				/>
			) : (
				<Field.Error
					errors={field.state.meta.errors}
					className={classNames?.error}
				/>
			)}
		</DatePicker>
	);
};
