import {
	Field,
	TextArea,
	TextField,
	type TextFieldProps,
} from "@/shared/components/hui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormTextAreaProps extends TextFieldProps, FieldCommonProps {}

export const FormTextArea = ({
	label,
	description,
	validationBehavior = "aria",
	classNames,
	...props
}: FormTextAreaProps) => {
	const field = useFieldContext<string | undefined>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<TextField
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
			<TextArea id={field.name} />
			<Field.Description
				description={description}
				className={classNames?.description}
			/>
			<Field.Error
				errors={field.state.meta.errors}
				className={classNames?.error}
			/>
		</TextField>
	);
};
