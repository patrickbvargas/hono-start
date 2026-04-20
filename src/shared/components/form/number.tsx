import {
	Field,
	NumberField,
	type NumberFieldProps,
} from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormNumberProps extends NumberFieldProps, FieldCommonProps {}

export const FormNumber = ({
	label,
	description,
	validationBehavior = "aria",
	classNames,
	...props
}: FormNumberProps) => {
	const field = useFieldContext<number>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<NumberField
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
			<NumberField.Group>
				<NumberField.DecrementButton />
				<NumberField.Input className="text-center" />
				<NumberField.IncrementButton />
			</NumberField.Group>
			<Field.Description
				description={description}
				className={classNames?.description}
			/>
			<Field.Error
				errors={field.state.meta.errors}
				className={classNames?.error}
			/>
		</NumberField>
	);
};
