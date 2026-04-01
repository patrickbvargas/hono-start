import { Input, type InputProps, TextField } from "@heroui/react";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Field } from "../hui/field";
import type { FieldCommonProps } from "./types";

interface FormInputProps extends FieldCommonProps, InputProps {}

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
		<TextField
			isInvalid={isInvalid}
			isRequired={isRequired}
			isDisabled={isDisabled}
			onChange={field.handleChange}
			className={classNames?.wrapper}
		>
			<Field.Label
				label={label}
				htmlFor={field.name}
				className={classNames?.label}
			/>
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				{...props}
			/>
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
