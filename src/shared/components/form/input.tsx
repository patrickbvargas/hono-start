import { Input, TextField, type TextFieldProps } from "@heroui/react";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Field } from "../hui/field";
import type { FieldCommonProps } from "./types";

interface FormInputProps extends TextFieldProps, FieldCommonProps {}

export const FormInput = ({
	label,
	description,
	validationBehavior = "aria",
	classNames,
	...props
}: FormInputProps) => {
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
			<Input id={field.name} />
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
