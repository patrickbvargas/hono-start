import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Textarea } from "../ui/textarea";
import type { FieldCommonProps } from "./types";
import { FormFieldWrapper } from "./utils/wrapper";

interface FormTextareaProps
	extends FieldCommonProps,
		React.ComponentPropsWithoutRef<typeof Textarea> {}

export const FormTextArea = ({
	label,
	description,
	isRequired,
	isDisabled,
	classNames,
	...props
}: FormTextareaProps) => {
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
			<Textarea
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
