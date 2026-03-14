import { useFieldContext } from "@/shared/hooks/use-app-form";
import { cn } from "@/shared/lib/utils";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import type { FieldClassNames, FieldCommonProps, FieldOption } from "./types";
import { FormField, FormFieldWrapperGroup, FormLabel } from "./utils";

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
		<FormFieldWrapperGroup
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
					<FormField
						key={option.value}
						orientation="horizontal"
						data-invalid={isInvalid}
						className={cn("w-fit", classNames?.item)}
					>
						<RadioGroupItem
							id={`radio-opt-${option.value}`}
							value={option.value}
						/>
						<FormLabel
							label={option.label}
							htmlFor={`radio-opt-${option.value}`}
						/>
					</FormField>
				))}
			</RadioGroup>
		</FormFieldWrapperGroup>
	);
};
