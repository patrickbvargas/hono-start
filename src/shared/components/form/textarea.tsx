import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Textarea } from "../ui/textarea";
import type { FieldCommonProps } from "./types";
import { FormDescription, FormError, FormField, FormLabel } from "./utils";

interface FormTextareaProps
	extends FieldCommonProps,
		React.ComponentProps<typeof Textarea> {}

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
		<FormField data-invalid={isInvalid} className={classNames?.wrapper}>
			<FormLabel
				label={label}
				htmlFor={field.name}
				isRequired={isRequired}
				className={classNames?.label}
			/>
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
