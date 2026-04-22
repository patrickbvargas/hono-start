import {
	Checkbox,
	Field,
	FieldGroup,
	FieldLabel,
	FieldWrapperGroup,
} from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { cn } from "@/shared/lib/utils";
import type {
	FieldClassNames,
	FieldCommonProps,
	FieldOption,
} from "@/shared/types/field";

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
		<FieldWrapperGroup
			id={field.name}
			label={label}
			description={description}
			isRequired={isRequired}
			errors={field.state.meta.errors}
			data-invalid={isInvalid}
			className={classNames?.wrapper}
		>
			<FieldGroup
				data-slot="checkbox-group"
				className={cn(
					"flex flex-col gap-2",
					orientation === "horizontal" && "flex-row",
					classNames?.list,
				)}
			>
				{options.map((option) => (
					<Field
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
							disabled={option.isDisabled || isDisabled}
							{...props}
						/>
						<FieldLabel htmlFor={`checkbox-opt-${option.value}`}>
							{option.label}
						</FieldLabel>
					</Field>
				))}
			</FieldGroup>
		</FieldWrapperGroup>
	);
};
