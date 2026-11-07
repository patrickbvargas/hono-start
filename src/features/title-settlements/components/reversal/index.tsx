import { EntityForm } from "@/shared/components/entity-form";
import { FormSection } from "@/shared/components/form-section";
import { FieldGroup } from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";
import { useReversalForm } from "../../hooks/use-form";
import type { SettlementTargetInput } from "../../schemas/form";

interface ReversalFormProps {
	target: SettlementTargetInput;
	movementId: number;
	state: OverlayState;
}
export function ReversalForm({ target, movementId, state }: ReversalFormProps) {
	const { form } = useReversalForm({
		target,
		movementId,
		onSuccess: state.close,
	});
	return (
		<form.Form form={form}>
			<EntityForm
				state={state}
				title="Estornar baixa"
				footer={
					<form.Submit variant="destructive">Confirmar estorno</form.Submit>
				}
			>
				<FormSection title="Estorno" variant="plain">
					<p className="text-sm">
						Estornar{" "}
						{target.direction === "receivable" ? "recebimento" : "pagamento"} #
						{movementId} do título #{target.titleId}? O saldo será recomposto e
						a baixa original permanecerá no histórico.
					</p>
					<FieldGroup className="grid gap-4 sm:grid-cols-2">
						<form.AppField name="effectiveDate">
							{(field) => (
								<field.DatePicker label="Data do estorno" isRequired />
							)}
						</form.AppField>
						<form.AppField name="reason">
							{(field) => (
								<field.Textarea
									label="Motivo do estorno"
									classNames={{ wrapper: "sm:col-span-2" }}
									isRequired
								/>
							)}
						</form.AppField>
					</FieldGroup>
				</FormSection>
			</EntityForm>
		</form.Form>
	);
}
