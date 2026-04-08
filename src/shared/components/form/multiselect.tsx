import * as React from "react";
import {
	Autocomplete,
	type AutocompleteProps,
	EmptyState,
	Field,
	type Key,
	ListBox,
	SearchField,
	Tag,
	TagGroup,
} from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type {
	FieldClassNames,
	FieldCommonProps,
	FieldOption,
} from "@/shared/types/field";

interface FormMultiselectProps
	extends AutocompleteProps<FieldOption, "multiple">,
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

export const FormMultiselect = ({
	label,
	description,
	options = [],
	placeholder = "Selecionar itens...",
	emptyMessage = "Nenhum item encontrado",
	validationBehavior = "aria",
	classNames,
	...props
}: FormMultiselectProps) => {
	const field = useFieldContext<Key[]>();
	const [isOpen, setIsOpen] = React.useState(false);

	const triggerRef = React.useRef<HTMLDivElement>(null);
	const popoverRef = React.useRef<HTMLDivElement>(null);

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	const onRemoveTags = (keys: Set<Key>) => {
		field.handleChange((prev) => prev.filter((key) => !keys.has(key)));
	};

	React.useEffect(() => {
		if (isOpen && popoverRef.current && triggerRef.current) {
			const selectRect = triggerRef.current.getBoundingClientRect();
			const popover = popoverRef.current;
			popover.style.width = `${selectRect.width}px`;
		}
	}, [isOpen]);

	return (
		<Autocomplete
			ref={triggerRef}
			name={field.name}
			isInvalid={isInvalid}
			selectionMode="multiple"
			value={Array.from(field.state.value).map(String)}
			onBlur={field.handleBlur}
			onChange={field.handleChange}
			placeholder={placeholder}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			validationBehavior={validationBehavior}
			className={classNames?.wrapper}
			{...props}
		>
			<Field.Label
				label={label}
				htmlFor={field.name}
				className={classNames?.label}
			/>
			<Autocomplete.Trigger>
				<Autocomplete.Value>
					{({ defaultChildren, isPlaceholder, state }) => {
						if (isPlaceholder || state.selectedItems.length === 0) {
							return defaultChildren;
						}
						const selectedItemsKeys = state.selectedItems.map(
							(item) => item.key,
						);
						return (
							<TagGroup size="sm" onRemove={onRemoveTags}>
								<TagGroup.List>
									{selectedItemsKeys.map((selectedItemKey) => {
										const option = options.find(
											(opt) => opt.value === selectedItemKey,
										);
										if (!option) return null;
										return (
											<Tag key={option.value} id={option.value}>
												{option.label}
											</Tag>
										);
									})}
								</TagGroup.List>
							</TagGroup>
						);
					}}
				</Autocomplete.Value>
				<Autocomplete.ClearButton />
				<Autocomplete.Indicator />
			</Autocomplete.Trigger>
			<Autocomplete.Popover ref={popoverRef} placement="bottom start">
				<Autocomplete.Filter>
					<SearchField
						autoFocus
						name="search"
						variant="secondary"
						aria-label="Busca"
					>
						<SearchField.Group>
							<SearchField.SearchIcon />
							<SearchField.Input placeholder="Buscar..." />
							<SearchField.ClearButton />
						</SearchField.Group>
					</SearchField>
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
				</Autocomplete.Filter>
			</Autocomplete.Popover>
			{!isInvalid ? (
				<Field.Description
					description={description}
					className={classNames?.description}
				/>
			) : (
				<Field.Error
					errors={field.state.meta.errors}
					className={classNames?.error}
				/>
			)}
		</Autocomplete>
	);
};
