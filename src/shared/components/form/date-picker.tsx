import { parseDate } from "@internationalized/date";
import { DatePicker, FieldWrapper } from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormDatePickerProps
	extends FieldCommonProps,
		React.ComponentPropsWithoutRef<typeof DatePicker> {}

export const FormDatePicker = ({
	label,
	description,
	isRequired,
	isDisabled,
	classNames,
	...props
}: FormDatePickerProps) => {
	const field = useFieldContext<string>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FieldWrapper
			id={field.name}
			label={label}
			description={description}
			isRequired={isRequired}
			errors={field.state.meta.errors}
			data-invalid={isInvalid}
			className={classNames?.wrapper}
		>
			<DatePicker
				id={field.name}
				name={field.name}
				value={field.state.value ? parseDate(field.state.value) : null}
				onBlur={field.handleBlur}
				onChange={(value) => field.handleChange(value ? value.toString() : "")}
				isDisabled={isDisabled}
				isRequired={isRequired}
				isInvalid={isInvalid}
				aria-invalid={isInvalid}
				{...props}
			/>
		</FieldWrapper>
	);
};
