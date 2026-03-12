import { FormDescription } from "./description";
import { FormError } from "./error";
import { FormField } from "./field";
import { FormLabel } from "./label";

interface FormFieldWrapperProps
	extends React.ComponentPropsWithoutRef<typeof FormField> {
	id: string;
	label?: string;
	isRequired?: boolean;
	description?: string;
	errors?: Array<{ message?: string } | undefined>;
}

export const FormFieldWrapper = ({
	id,
	label,
	isRequired,
	children,
	description,
	errors,
	...props
}: FormFieldWrapperProps) => {
	return (
		<FormField {...props}>
			{label && (
				<FormLabel label={label} htmlFor={id} isRequired={isRequired} />
			)}
			{children}
			{description && <FormDescription description={description} />}
			{errors && <FormError errors={errors} />}
		</FormField>
	);
};
