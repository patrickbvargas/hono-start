import { useFieldContext } from "@/shared/hooks/use-app-form";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from "../ui/combobox";
import type { FieldClassNames, FieldCommonProps, FieldOption } from "./types";
import { FormDescription, FormError, FormField, FormLabel } from "./utils";

interface FormMultiselectProps
	extends FieldCommonProps,
		React.ComponentProps<typeof Combobox> {
	options: FieldOption[];
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	classNames?: FieldClassNames & {
		list?: string;
		item?: string;
	};
}

export const FormMultiselect = ({
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
}: FormMultiselectProps) => {
	const anchor = useComboboxAnchor();
	const field = useFieldContext<string[]>();

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
					if (!Array.isArray(e)) return;
					field.handleChange(e);
				}}
				aria-invalid={isInvalid}
				disabled={isDisabled}
				items={options}
				multiple
				autoHighlight
				{...props}
			>
				<ComboboxChips ref={anchor} className="w-full max-w-xs">
					<ComboboxValue>
						{(values) => (
							<>
								{values.map((value: string) => (
									<ComboboxChip key={value}>
										{options.find((opt) => opt.value === value)?.label || value}
									</ComboboxChip>
								))}
								<ComboboxChipsInput
									placeholder={searchPlaceholder}
									aria-invalid={isInvalid}
								/>
							</>
						)}
					</ComboboxValue>
				</ComboboxChips>
				<ComboboxContent anchor={anchor}>
					<ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
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
