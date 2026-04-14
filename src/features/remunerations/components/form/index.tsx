import { FormWrapper } from "@/shared/components/form-wrapper";
import { Field } from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemunerationForm } from "../../hooks/use-form";
import type { Remuneration } from "../../schemas/model";
import { defaultRemunerationUpdateValues } from "../../utils/default";

interface RemunerationFormProps {
	remuneration: Remuneration;
	state: OverlayState;
	onSuccess?: () => void;
}

export const RemunerationForm = ({
	remuneration,
	state,
	onSuccess,
}: RemunerationFormProps) => {
	const { form } = useRemunerationForm({
		initialData: defaultRemunerationUpdateValues(remuneration),
		onSuccess,
	});

	return (
		<form.Form form={form}>
			<FormWrapper
				state={state}
				title="Editar remuneração"
				footer={<form.Submit />}
			>
				<Field.Group className="grid-cols-2">
					<form.AppField name="amount">
						{(field) => (
							<field.Number
								label="Valor"
								minValue={0}
								step={100}
								variant="secondary"
								isRequired
								fullWidth
								formatOptions={{
									style: "currency",
									currency: "BRL",
								}}
							/>
						)}
					</form.AppField>
					<form.AppField name="effectivePercentage">
						{(field) => (
							<field.Number
								label="Percentual efetivo"
								minValue={0}
								maxValue={1}
								step={0.01}
								variant="secondary"
								isRequired
								fullWidth
							/>
						)}
					</form.AppField>
				</Field.Group>
			</FormWrapper>
		</form.Form>
	);
};
