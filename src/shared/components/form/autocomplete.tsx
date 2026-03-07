import { useFieldContext } from "@/shared/hooks/use-app-form";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	useComboboxAnchor,
} from "../ui/combobox";
import type { FieldClassNames, FieldCommonProps, FieldOption } from "./types";
import { FormDescription, FormError, FormField, FormLabel } from "./utils";

interface FormAutocompleteProps
	extends FieldCommonProps,
		React.ComponentProps<typeof Combobox> {
	options: FieldOption[];
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
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
	placeholder = "Selecionar item...",
	searchPlaceholder = "Buscar...",
	emptyMessage = "Nenhum item encontrado",
	classNames,
	...props
}: FormAutocompleteProps) => {
	const anchor = useComboboxAnchor();
	const field = useFieldContext<string>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FormField data-invalid={isInvalid} className={classNames?.wrapper}>
			<FormLabel
				label={label}
				htmlFor={field.name}
				isRequired={isRequired}
				className={classNames?.label}
			/>
			<Combobox
				id={field.name}
				name={field.name}
				value={field.state.value}
				onValueChange={(e) => {
					console.log(e);
					field.handleChange(String(e));
				}}
				aria-invalid={isInvalid}
				disabled={isDisabled}
				items={options}
				itemToStringValue={(option) => (option as FieldOption).value}
				{...props}
			>
				<ComboboxInput placeholder={placeholder} aria-invalid={isInvalid} />
				<ComboboxContent anchor={anchor}>
					<ComboboxEmpty className={classNames?.empty}>
						{emptyMessage}
					</ComboboxEmpty>
					<ComboboxList className={classNames?.list}>
						{(option) => (
							<ComboboxItem
								key={option.value}
								value={option.value}
								className={classNames?.item}
								disabled={option.isDisabled}
							>
								{option.label}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			<FormDescription
				description={description}
				className={classNames?.description}
			/>
			<FormError
				errors={field.state.meta.errors}
				className={classNames?.error}
			/>
		</FormField>
	);
};
