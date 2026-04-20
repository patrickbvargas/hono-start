import {
	Field,
	Label,
	Radio,
	RadioGroup,
	type RadioGroupProps,
} from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { cn } from "@/shared/lib/utils";
import type {
	FieldClassNames,
	FieldCommonProps,
	FieldOption,
} from "@/shared/types/field";

interface FormRadioGroupProps extends RadioGroupProps, FieldCommonProps {
	options: FieldOption[];
	classNames?: FieldClassNames & {
		item?: string;
	};
}

export const FormRadioGroup = ({
	label,
	description,
	options = [],
	validationBehavior = "aria",
	classNames,
	...props
}: FormRadioGroupProps) => {
	const field = useFieldContext<string>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<RadioGroup
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
			<Field.Description
				description={description}
				className={classNames?.description}
			/>
			{options.map((option) => (
				<Radio
					key={option.value}
					value={option.value}
					isDisabled={option.isDisabled}
				>
					<Radio.Control>
						<Radio.Indicator />
					</Radio.Control>
					<Radio.Content className={classNames?.item}>
						<Label>{option.label}</Label>
					</Radio.Content>
				</Radio>
			))}
			<Field.Error
				errors={field.state.meta.errors}
				className={cn("mt-2", classNames?.error)}
			/>
		</RadioGroup>
	);
};
