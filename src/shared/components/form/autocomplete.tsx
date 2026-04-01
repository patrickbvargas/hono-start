import {
	Autocomplete,
	type AutocompleteRootProps,
	EmptyState,
	ListBox,
	SearchField,
} from "@heroui/react";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Field } from "../hui/field";
import type { FieldClassNames, FieldCommonProps, FieldOption } from "./types";

interface FormAutocompleteProps extends FieldCommonProps {
	options: FieldOption[];
	placeholder?: string;
	emptyMessage?: string;
	// isClearable?: boolean;
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
	// isClearable = true,
	placeholder = "Selecionar item...",
	emptyMessage = "Nenhum item encontrado",
	classNames,
	...props
}: FormAutocompleteProps) => {
	const field = useFieldContext<string>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Autocomplete
			isInvalid={isInvalid}
			isRequired={isRequired}
			isDisabled={isDisabled}
			selectionMode="single"
			value={field.state.value}
			onChange={(v) => field.handleChange(String(v))}
			className={classNames?.wrapper}
			{...props}
		>
			<Field.Label
				label={label}
				htmlFor={field.name}
				className={classNames?.label}
			/>
			<Autocomplete.Trigger>
				<Autocomplete.Value />
				<Autocomplete.ClearButton />
				<Autocomplete.Indicator />
			</Autocomplete.Trigger>
			<Autocomplete.Popover>
				<Autocomplete.Filter>
					<SearchField autoFocus name="search" variant="secondary">
						<SearchField.Group>
							<SearchField.SearchIcon />
							<SearchField.Input placeholder={placeholder} />
							<SearchField.ClearButton />
						</SearchField.Group>
					</SearchField>
					<ListBox
						renderEmptyState={() => (
							<EmptyState className={classNames?.empty}>
								{emptyMessage}
							</EmptyState>
						)}
					>
						{options.map((option) => (
							<ListBox.Item
								key={option.value}
								id={option.value}
								textValue={option.value}
								isDisabled={option.isDisabled}
								className={classNames?.item}
							>
								{option.label}
								<ListBox.ItemIndicator />
							</ListBox.Item>
						))}
					</ListBox>
				</Autocomplete.Filter>
			</Autocomplete.Popover>
			<Field.Description
				description={description}
				className={classNames?.description}
			/>
			<Field.Error
				errors={field.state.meta.errors}
				className={classNames?.error}
			/>
		</Autocomplete>
	);
};
