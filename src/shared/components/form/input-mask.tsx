import { useTanStackFormMask } from "use-mask-input";
import { FieldWrapper, Input } from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import {
	type BuiltInInputMaskKind,
	getBuiltInInputMaskDefinition,
} from "@/shared/lib/input-mask";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormInputMaskProps
	extends FieldCommonProps,
		Omit<React.ComponentPropsWithoutRef<typeof Input>, "value" | "onChange"> {
	maskKind: BuiltInInputMaskKind;
}

export const FormInputMask = ({
	label,
	description,
	isRequired,
	isDisabled,
	classNames,
	maskKind,
	maxLength,
	...props
}: FormInputMaskProps) => {
	const field = useFieldContext<string>();
	const maskField = useTanStackFormMask();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const maskDefinition = getBuiltInInputMaskDefinition(maskKind);

	const maskedInputProps = maskField(
		maskDefinition.mask,
		{
			name: field.name,
			value: field.state.value,
			onBlur: field.handleBlur,
			onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
				field.handleChange(event.target.value),
		},
		maskDefinition.options,
	);
	const {
		ref,
		prevRef: _prevRef,
		unmaskedValue: _unmaskedValue,
		...maskedFieldProps
	} = maskedInputProps;

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
			<Input
				id={field.name}
				aria-invalid={isInvalid}
				disabled={isDisabled}
				required={isRequired}
				maxLength={maxLength ?? maskDefinition.maxLength}
				ref={ref}
				{...maskedFieldProps}
				{...props}
			/>
		</FieldWrapper>
	);
};
