import { EntityForm } from "@/shared/components/entity-form";
import { FieldGroup } from "@/shared/components/ui";
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
			<EntityForm
				state={state}
				title="Editar remuneração"
				footer={<form.Submit />}
			>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<form.AppField name="amount">
						{(field) => (
							<field.Number
								label="Valor"
								minValue={0}
								step={100}
								isRequired
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
								isRequired
							/>
						)}
					</form.AppField>
				</FieldGroup>
			</EntityForm>
		</form.Form>
	);
};
