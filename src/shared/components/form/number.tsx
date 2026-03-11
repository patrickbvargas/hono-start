import { useFieldContext } from "@/shared/hooks/use-app-form";
import { InputNumber } from "../ui/input-number";
import type { FieldCommonProps } from "./types";
import { FormDescription, FormError, FormField, FormLabel } from "./utils";

interface FormNumberProps
	extends FieldCommonProps,
		React.ComponentPropsWithoutRef<typeof InputNumber> {}

export const FormNumber = ({
	label,
	description,
	isRequired,
	isDisabled,
	classNames,
	...props
}: FormNumberProps) => {
	const field = useFieldContext<number>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FormField data-invalid={isInvalid} className={classNames?.wrapper}>
			<FormLabel
				label={label}
				htmlFor={field.name}
				isRequired={isRequired}
				className={classNames?.label}
			/>
			<InputNumber
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
