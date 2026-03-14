import { useFieldContext } from "@/shared/hooks/use-app-form";
import { cn } from "@/shared/lib/utils";
import { Checkbox } from "../ui/checkbox";
import type { FieldClassNames, FieldCommonProps, FieldOption } from "./types";
import {
	FormField,
	FormFieldWrapperGroup,
	FormGroup,
	FormLabel,
} from "./utils";

interface FormCheckboxGroupProps
	extends FieldCommonProps,
		React.ComponentPropsWithoutRef<typeof Checkbox> {
	options: FieldOption[];
	orientation?: "horizontal" | "vertical";
	classNames?: FieldClassNames & {
		list?: string;
		item?: string;
	};
}

export const FormCheckboxGroup = ({
	label,
	description,
	isRequired,
	isDisabled,
	options = [],
	orientation = "vertical",
	classNames,
	...props
}: FormCheckboxGroupProps) => {
	const field = useFieldContext<string[]>();

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
			<FormGroup
				data-slot="checkbox-group"
				className={cn(
					"flex flex-col gap-2",
					orientation === "horizontal" && "flex-row",
					classNames?.list,
				)}
			>
				{options.map((option) => (
					<FormField
						key={option.value}
						orientation="horizontal"
						data-invalid={isInvalid}
						className={classNames?.item}
					>
						<Checkbox
							id={`checkbox-opt-${option.value}`}
							name={field.name}
							checked={field.state.value.includes(option.value)}
							onBlur={field.handleBlur}
							onCheckedChange={(checked) => {
								if (checked) {
									field.pushValue(option.value);
								} else {
									const index = field.state.value.indexOf(option.value);
									if (index > -1) field.removeValue(index);
								}
							}}
							aria-invalid={isInvalid}
							disabled={option.disabled || isDisabled}
							{...props}
						/>
						<FormLabel
							label={option.label}
							htmlFor={`checkbox-opt-${option.value}`}
						/>
					</FormField>
				))}
			</FormGroup>
		</FormFieldWrapperGroup>
	);
};
