import { Checkbox, FieldWrapper } from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { cn } from "@/shared/lib/utils";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormCheckboxProps
	extends Omit<FieldCommonProps, "description">,
		React.ComponentPropsWithoutRef<typeof Checkbox> {}

export const FormCheckbox = ({
	label,
	isRequired,
	isDisabled,
	classNames,
	...props
}: FormCheckboxProps) => {
	const field = useFieldContext<boolean>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FieldWrapper
			id={field.name}
			label={label}
			isRequired={isRequired}
			errors={field.state.meta.errors}
			data-invalid={isInvalid}
			className={cn(classNames?.wrapper, "flex-row-reverse")}
			orientation="horizontal"
		>
			<Checkbox
				id={field.name}
				name={field.name}
				checked={field.state.value}
				onBlur={field.handleBlur}
				onCheckedChange={field.handleChange}
				aria-invalid={isInvalid}
				disabled={isDisabled}
				{...props}
			/>
		</FieldWrapper>
	);
};
