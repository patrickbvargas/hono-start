import { FormWrapper } from "@/shared/components/form-wrapper";
import { Field } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemunerationForm } from "../../hooks/use-form";

interface RemunerationFormProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const RemunerationForm = ({
	id,
	state,
	onSuccess,
}: RemunerationFormProps) => {
	const { form } = useRemunerationForm({
		id,
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
