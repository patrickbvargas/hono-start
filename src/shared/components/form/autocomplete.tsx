import * as React from "react";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "../ui/combobox";
import type { FieldClassNames, FieldCommonProps, FieldOption } from "./types";
import { FormFieldWrapper } from "./utils/wrapper";

interface FormAutocompleteProps
	extends FieldCommonProps,
		Omit<
			React.ComponentPropsWithoutRef<typeof Combobox<FieldOption>>,
			"multiple"
		> {
	options: FieldOption[];
	placeholder?: string;
	emptyMessage?: string;
	isClearable?: boolean;
	classNames?: FieldClassNames & {
		empty?: string;
		list?: string;
		item?: string;
	};
}

export const FormAutocomplete = ({
	label,
	description,
	isRequired,
	isDisabled,
	options,
	isClearable = true,
	placeholder = "Selecionar item...",
	emptyMessage = "Nenhum item encontrado",
	classNames,
	...props
}: FormAutocompleteProps) => {
	const field = useFieldContext<string>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	const selectedOption = React.useMemo(
		() => options.find((opt) => opt.value === field.state.value) ?? null,
		[options, field.state.value],
	);

	const handleValueChange = React.useCallback(
		(option: FieldOption | null) => {
			if (!option) {
				field.clearValues();
				return;
			}

			field.handleChange(option.value);
		},
		[field],
	);

	return (
		<FormFieldWrapper
			id={field.name}
			label={label}
			description={description}
			isRequired={isRequired}
			errors={field.state.meta.errors}
			data-invalid={isInvalid}
			className={classNames?.wrapper}
		>
			<Combobox
				id={field.name}
				name={field.name}
				value={selectedOption}
				onValueChange={handleValueChange}
				aria-invalid={isInvalid}
				disabled={isDisabled}
				items={options}
				itemToStringValue={(option) => option.label}
				{...props}
			>
				<ComboboxInput
					placeholder={placeholder}
					aria-invalid={isInvalid}
					showClear={isClearable}
				/>
				<ComboboxContent>
					<ComboboxEmpty className={classNames?.empty}>
						{emptyMessage}
					</ComboboxEmpty>
					<ComboboxList className={classNames?.list}>
						{(option) => (
							<ComboboxItem
								key={option.value}
								value={option}
								className={classNames?.item}
								disabled={option.isDisabled}
							>
								{option.label}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</FormFieldWrapper>
	);
};
