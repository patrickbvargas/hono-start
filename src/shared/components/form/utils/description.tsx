import { FieldDescription } from "../../ui/field";

interface FormDescriptionProps
	extends React.ComponentProps<typeof FieldDescription> {
	description?: string;
}

export const FormDescription = ({
	description,
	...props
}: FormDescriptionProps) => {
	if (!description) return null;

	return <FieldDescription {...props}>{description}</FieldDescription>;
};
