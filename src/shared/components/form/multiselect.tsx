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
	FieldWrapper,
	useComboboxAnchor,
} from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type {
	FieldClassNames,
	FieldCommonProps,
	FieldOption,
} from "@/shared/types/field";

interface FormMultiselectProps
	extends FieldCommonProps,
		React.ComponentPropsWithoutRef<typeof Combobox> {
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
		<FieldWrapper
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
		</FieldWrapper>
	);
};
