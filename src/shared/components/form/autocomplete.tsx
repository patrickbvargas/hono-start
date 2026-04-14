import {
	ComboBox,
	type ComboBoxProps,
	EmptyState,
	Field,
	Input,
	type Key,
	ListBox,
} from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { cn } from "@/shared/lib/utils";
import type {
	FieldClassNames,
	FieldCommonProps,
	FieldOption,
} from "@/shared/types/field";

interface FormAutocompleteProps
	extends ComboBoxProps<FieldOption>,
		FieldCommonProps {
	options: FieldOption[];
	placeholder?: string;
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
	options = [],
	placeholder = "Selecionar item...",
	emptyMessage = "Nenhum item encontrado",
	validationBehavior = "aria",
	classNames,
	...props
}: FormAutocompleteProps) => {
	const field = useFieldContext<Key | null>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	const handleChange = (value: Key | null) => {
		field.handleChange(value?.toString() ?? null);
	};

	return (
		<ComboBox
			name={field.name}
			isInvalid={isInvalid}
			value={field.state.value}
			onBlur={field.handleBlur}
			onChange={handleChange}
			validationBehavior={validationBehavior}
			className={cn("min-w-0", classNames?.wrapper)}
			{...props}
		>
			<Field.Label
				label={label}
				htmlFor={field.name}
				className={classNames?.label}
			/>
			<ComboBox.InputGroup>
				<Input id={field.name} placeholder={placeholder} />
				<ComboBox.Trigger />
			</ComboBox.InputGroup>
			<ComboBox.Popover>
				<ListBox
					renderEmptyState={() => (
						<EmptyState className={classNames?.empty}>
							{emptyMessage}
						</EmptyState>
					)}
					className={classNames?.list}
				>
					{options.map((option) => (
						<ListBox.Item
							key={option.value}
							id={option.value}
							textValue={option.label}
							isDisabled={option.isDisabled}
							className={classNames?.item}
						>
							{option.label}
							<ListBox.ItemIndicator />
						</ListBox.Item>
					))}
				</ListBox>
			</ComboBox.Popover>
			<Field.Description
				description={description}
				className={classNames?.description}
			/>
			<Field.Error
				errors={field.state.meta.errors}
				className={classNames?.error}
			/>
		</ComboBox>
	);
};
