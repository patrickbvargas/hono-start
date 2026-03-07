import { FieldLegend } from "../../ui/field";

interface FormLegendProps extends React.ComponentProps<typeof FieldLegend> {
	label?: string;
	isRequired?: boolean;
}

export const FormLegend = ({
	label,
	isRequired,
	...props
}: FormLegendProps) => {
	if (!label) return null;

	return (
		<FieldLegend {...props}>
			{label}
			{isRequired && <span className="text-destructive">*</span>}
		</FieldLegend>
	);
};
