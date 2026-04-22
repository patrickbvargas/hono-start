import { FormWrapper } from "@/shared/components/form-wrapper";
import { FieldGroup } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useFeeForm } from "../../hooks/use-form";
import { useFeeOptions } from "../../hooks/use-options";

interface FeeFormProps {
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const FeeForm = ({ id, state, onSuccess }: FeeFormProps) => {
	const { form } = useFeeForm({
		id,
		onSuccess,
	});

	return (
		<form.Form form={form} showDebug>
			<form.Subscribe selector={(current) => current.values.contractId}>
				{(contractId) => (
					<FeeFormFields
						contractId={contractId}
						form={form}
						state={state}
						title={id ? "Editar honorário" : "Novo honorário"}
					/>
				)}
			</form.Subscribe>
		</form.Form>
	);
};

interface FeeFormFieldsProps {
	contractId: string;
	form: ReturnType<typeof useFeeForm>["form"];
	state: OverlayState;
	title: string;
}

function FeeFormFields({ contractId, form, state, title }: FeeFormFieldsProps) {
	const { contracts, revenues } = useFeeOptions(contractId);

	return (
		<FormWrapper state={state} title={title} footer={<form.Submit />}>
			<FieldGroup className="grid gap-5 sm:grid-cols-2">
				<form.AppField name="contractId">
					{(field) => (
						<field.Autocomplete
							label="Contrato"
							options={contracts}
							isRequired
						/>
					)}
				</form.AppField>
				<form.AppField name="revenueId">
					{(field) => (
						<field.Autocomplete label="Receita" options={revenues} isRequired />
					)}
				</form.AppField>
				<form.AppField name="paymentDate">
					{(field) => <field.DatePicker label="Data de pagamento" isRequired />}
				</form.AppField>
				<form.AppField name="installmentNumber">
					{(field) => (
						<field.Number label="Parcela" minValue={1} step={1} isRequired />
					)}
				</form.AppField>
			</FieldGroup>
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
			</FieldGroup>
			<FieldGroup className="grid gap-5 sm:grid-cols-2">
				<form.AppField name="generatesRemuneration">
					{(field) => (
						<field.Checkbox label="Gerar remunerações automaticamente" />
					)}
				</form.AppField>
				<form.AppField name="isActive">
					{(field) => <field.Checkbox label="Ativo" />}
				</form.AppField>
			</FieldGroup>
		</FormWrapper>
	);
}
