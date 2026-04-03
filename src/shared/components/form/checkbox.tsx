import { Checkbox, type CheckboxProps, Field } from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormCheckboxProps extends CheckboxProps, FieldCommonProps {}

export const FormCheckbox = ({
	label,
	description,
	isRequired,
	classNames,
	...props
}: FormCheckboxProps) => {
	const field = useFieldContext<boolean>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Checkbox
			name={field.name}
			isInvalid={isInvalid}
			isSelected={field.state.value}
			onBlur={field.handleBlur}
			onChange={field.handleChange}
			className={classNames?.wrapper}
			{...props}
		>
			<Checkbox.Control>
				<Checkbox.Indicator />
			</Checkbox.Control>
			<Checkbox.Content>
				<Field.Label
					label={label}
					htmlFor={field.name}
					isRequired={isRequired}
					className={classNames?.label}
				/>
				<Field.Description
					description={description}
					className={classNames?.description}
				/>
				<Field.Error
					errors={field.state.meta.errors}
					className={classNames?.error}
				/>
			</Checkbox.Content>
		</Checkbox>
	);
};
