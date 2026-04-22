import { FieldWrapper, Textarea } from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type { FieldCommonProps } from "@/shared/types/field";

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
		<FieldWrapper
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
		</FieldWrapper>
	);
};
