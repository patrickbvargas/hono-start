import { FieldWrapper, InputNumber } from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormNumberProps
	extends FieldCommonProps,
		React.ComponentPropsWithoutRef<typeof InputNumber> {}

export const FormNumber = ({
	label,
	description,
	isRequired,
	isDisabled,
	classNames,
	...props
}: FormNumberProps) => {
	const field = useFieldContext<number>();

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
			<InputNumber
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={field.handleChange}
				isDisabled={isDisabled}
				isRequired={isRequired}
				isInvalid={isInvalid}
				aria-invalid={isInvalid}
				{...props}
			/>
		</FieldWrapper>
	);
};
