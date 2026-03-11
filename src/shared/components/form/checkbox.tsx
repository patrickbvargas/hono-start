import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Checkbox } from "../ui/checkbox";
import type { FieldCommonProps } from "./types";
import { FormError, FormField, FormLabel } from "./utils";

interface FormCheckboxProps
	extends Omit<FieldCommonProps, "description">,
		React.ComponentPropsWithoutRef<typeof Checkbox> {}

export const FormCheckbox = ({
	label,
	isRequired,
	isDisabled,
	classNames,
	...props
}: FormCheckboxProps) => {
	const field = useFieldContext<boolean>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FormField data-invalid={isInvalid} orientation="horizontal">
			<Checkbox
				id={field.name}
				name={field.name}
				checked={field.state.value}
				onBlur={field.handleBlur}
				onCheckedChange={field.handleChange}
				aria-invalid={isInvalid}
				disabled={isDisabled}
				{...props}
			/>
			<FormLabel
				label={label}
				htmlFor={field.name}
				isRequired={isRequired}
				className={classNames?.label}
			/>
			<FormError
				errors={field.state.meta.errors}
				className={classNames?.error}
			/>
		</FormField>
	);
};
