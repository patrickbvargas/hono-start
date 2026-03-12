import type { DateValue } from "@internationalized/date";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { DatePicker } from "../ui/date-picker";
import type { FieldCommonProps } from "./types";
import { FormFieldWrapper } from "./utils/wrapper";

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
	const field = useFieldContext<DateValue | null>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FormFieldWrapper
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
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={field.handleChange}
				isDisabled={isDisabled}
				isRequired={isRequired}
				isInvalid={isInvalid}
				aria-invalid={isInvalid}
				{...props}
			/>
		</FormFieldWrapper>
	);
};
