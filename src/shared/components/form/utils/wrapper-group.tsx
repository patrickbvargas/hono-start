import { FormDescription } from "./description";
import { FormError } from "./error";
import { FormFieldSet } from "./fieldset";
import { FormGroup } from "./group";
import { FormLegend } from "./legend";

interface FormFieldWrapperGroupProps
	extends React.ComponentPropsWithoutRef<typeof FormGroup> {
	id: string;
	label?: string;
	isRequired?: boolean;
	description?: string;
	errors?: Array<{ message?: string } | undefined>;
}

export const FormFieldWrapperGroup = ({
	id,
	label,
	isRequired,
	children,
	description,
	errors,
	...props
}: FormFieldWrapperGroupProps) => {
	return (
		<FormGroup {...props}>
			<FormFieldSet>
				{label && (
					<FormLegend variant="label" label={label} isRequired={isRequired} />
				)}
				{description && <FormDescription description={description} />}
				{children}
			</FormFieldSet>
			{errors && <FormError errors={errors} />}
		</FormGroup>
	);
};
