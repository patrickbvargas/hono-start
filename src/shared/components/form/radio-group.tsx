import {
	Field,
	FieldLabel,
	FieldWrapperGroup,
	RadioGroup,
	RadioGroupItem,
} from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { cn } from "@/shared/lib/utils";
import type {
	FieldClassNames,
	FieldCommonProps,
	FieldOption,
} from "@/shared/types/field";

interface FormRadioGroupProps
	extends FieldCommonProps,
		React.ComponentPropsWithoutRef<typeof RadioGroup> {
	options: FieldOption[];
	orientation?: "horizontal" | "vertical";
	classNames?: FieldClassNames & {
		list?: string;
		item?: string;
	};
}

export const FormRadioGroup = ({
	label,
	description,
	isRequired,
	isDisabled,
	options = [],
	orientation = "vertical",
	classNames,
	...props
}: FormRadioGroupProps) => {
	const field = useFieldContext<string>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FieldWrapperGroup
			id={field.name}
			label={label}
			description={description}
			isRequired={isRequired}
			errors={field.state.meta.errors}
			data-invalid={isInvalid}
			className={classNames?.wrapper}
		>
			<RadioGroup
				name={field.name}
				value={field.state.value}
				onValueChange={field.handleChange}
				className={cn(
					"flex flex-col",
					orientation === "horizontal" && "flex-row",
					classNames?.list,
				)}
				{...props}
			>
				{options.map((option) => (
					<Field
						key={option.value}
						orientation="horizontal"
						data-invalid={isInvalid}
						className={cn("w-fit", classNames?.item)}
					>
						<RadioGroupItem
							id={`radio-opt-${option.value}`}
							value={option.value}
						/>
						<FieldLabel htmlFor={`radio-opt-${option.value}`}>
							{option.label}
						</FieldLabel>
					</Field>
				))}
			</RadioGroup>
		</FieldWrapperGroup>
	);
};
