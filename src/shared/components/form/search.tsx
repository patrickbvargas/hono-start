import { SearchIcon } from "lucide-react";
import {
	FieldWrapper,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormSearchProps
	extends FieldCommonProps,
		React.ComponentPropsWithoutRef<typeof InputGroup> {
	placeholder?: string;
}

export const FormSearch = ({
	label,
	description,
	isRequired,
	isDisabled,
	classNames,
	placeholder,
	...props
}: FormSearchProps) => {
	const field = useFieldContext<string>();

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
			<InputGroup {...props}>
				<InputGroupInput
					id={field.name}
					name={field.name}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					aria-invalid={isInvalid}
					disabled={isDisabled}
					required={isRequired}
					placeholder={placeholder}
				/>
				<InputGroupAddon align="inline-start">
					<SearchIcon className="text-muted-foreground" />
				</InputGroupAddon>
			</InputGroup>
		</FieldWrapper>
	);
};
