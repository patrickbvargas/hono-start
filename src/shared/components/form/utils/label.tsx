import { FieldLabel } from "../../ui/field";

interface FormLabelProps extends React.ComponentProps<typeof FieldLabel> {
	label: string;
	isRequired?: boolean;
}

export const FormLabel = ({ label, isRequired, ...props }: FormLabelProps) => {
	return (
		<FieldLabel {...props}>
			{label}
			{isRequired && <span className="text-destructive">*</span>}
		</FieldLabel>
	);
};
