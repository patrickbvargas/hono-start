import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Input } from "../ui/input";
import type { FieldCommonProps } from "./types";
import { FormFieldWrapper } from "./utils/wrapper";

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
		<FormFieldWrapper
			id={field.name}
			label={label}
			description={description}
			isRequired={isRequired}
			errors={field.state.meta.errors}
			data-invalid={isInvalid}
			className={classNames?.wrapper}
		>
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={isInvalid}
				disabled={isDisabled}
				required={isRequired}
				{...props}
			/>
		</FormFieldWrapper>
	);
};
