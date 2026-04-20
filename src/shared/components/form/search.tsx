import {
	Field,
	SearchField,
	type SearchFieldProps,
} from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormSearchProps extends SearchFieldProps, FieldCommonProps {
	placeholder?: string;
}

export const FormSearch = ({
	label,
	description,
	placeholder,
	validationBehavior = "aria",
	classNames,
	...props
}: FormSearchProps) => {
	const field = useFieldContext<string>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<SearchField
			name={field.name}
			isInvalid={isInvalid}
			value={field.state.value}
			onBlur={field.handleBlur}
			onChange={field.handleChange}
			validationBehavior={validationBehavior}
			className={classNames?.wrapper}
			{...props}
		>
			<Field.Label
				label={label}
				htmlFor={field.name}
				className={classNames?.label}
			/>
			<SearchField.Group>
				<SearchField.SearchIcon />
				<SearchField.Input placeholder={placeholder} />
				<SearchField.ClearButton />
			</SearchField.Group>
			<Field.Description
				description={description}
				className={classNames?.description}
			/>
			<Field.Error
				errors={field.state.meta.errors}
				className={classNames?.error}
			/>
		</SearchField>
	);
};
