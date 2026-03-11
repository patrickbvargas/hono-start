import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Input } from "../ui/input";
import type { FieldCommonProps } from "./types";
import { FormDescription, FormError, FormField, FormLabel } from "./utils";

interface FormInputProps
	extends FieldCommonProps,
		React.ComponentPropsWithoutRef<typeof Input> {}

export const FormInput = ({
	label,
	description,
	isRequired,
	isDisabled,
	classNames,
	...props
}: FormInputProps) => {
	const field = useFieldContext<string>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FormField data-invalid={isInvalid} className={classNames?.wrapper}>
			<FormLabel
				label={label}
				htmlFor={field.name}
				isRequired={isRequired}
				className={classNames?.label}
			/>
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value.trim())}
				aria-invalid={isInvalid}
				disabled={isDisabled}
				required={isRequired}
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
