import {
	Checkbox,
	CheckboxGroup,
	type CheckboxGroupProps,
	cn,
	Label,
} from "@heroui/react";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Field } from "../hui/field";
import type { FieldClassNames, FieldCommonProps, FieldOption } from "./types";

interface FormCheckboxGroupProps extends CheckboxGroupProps, FieldCommonProps {
	options: FieldOption[];
	classNames?: FieldClassNames & {
		item?: string;
	};
}

export const FormCheckboxGroup = ({
	label,
	description,
	options = [],
	validationBehavior = "aria",
	classNames,
	...props
}: FormCheckboxGroupProps) => {
	const field = useFieldContext<string[] | undefined>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<CheckboxGroup
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
				<Checkbox
					key={option.value}
					id={option.value}
					value={option.value}
					isDisabled={option.isDisabled}
					className={classNames?.item}
				>
					<Checkbox.Control>
						<Checkbox.Indicator />
					</Checkbox.Control>
					<Checkbox.Content>
						<Label>{option.label}</Label>
					</Checkbox.Content>
				</Checkbox>
			))}
			<Field.Error
				errors={field.state.meta.errors}
				className={cn("mt-2", classNames?.error)}
			/>
		</CheckboxGroup>
	);
};
