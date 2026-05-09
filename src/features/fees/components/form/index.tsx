import { Suspense } from "react";
import { EntityForm } from "@/shared/components/entity-form";
import {
	FormCheckboxSkeleton,
	FormFieldSkeleton,
} from "@/shared/components/form-field-skeleton";
import { FormSection } from "@/shared/components/form-section";
import { FieldGroup, Skeleton } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useFee, useFeeOptions } from "../../hooks/use-data";
import { useFeeForm } from "../../hooks/use-form";
import { getFeeEditOptionDefaults } from "../../utils/edit-options";

interface FeeFormProps {
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const FeeForm = ({ id, state, onSuccess }: FeeFormProps) => {
	const title = id ? "Editar honorário" : "Novo honorário";

	return (
		<Suspense fallback={<FeeFormSkeleton state={state} title={title} />}>
			{id ? (
				<EditFeeFormContent id={id} state={state} onSuccess={onSuccess} />
			) : (
				<CreateFeeFormContent state={state} onSuccess={onSuccess} />
			)}
		</Suspense>
	);
};

function CreateFeeFormContent({ state, onSuccess }: Omit<FeeFormProps, "id">) {
	const { form } = useFeeForm({ onSuccess });

	return (
		<form.Form form={form} showDebug>
			<form.Subscribe selector={(current) => current.values.contractId}>
				{(contractId) => (
					<FeeFormFields
						contractId={contractId}
						form={form}
						state={state}
						title="Novo honorário"
					/>
				)}
			</form.Subscribe>
		</form.Form>
	);
}

function EditFeeFormContent({
	id,
	state,
	onSuccess,
}: Required<Pick<FeeFormProps, "id">> & Omit<FeeFormProps, "id">) {
	const { fee } = useFee(id);
	const { currentContract, currentRevenue } = getFeeEditOptionDefaults(fee);
	const { form } = useFeeForm({
		id,
		initialValue: fee,
		onSuccess,
	});

	return (
		<form.Form form={form} showDebug>
			<form.Subscribe selector={(current) => current.values.contractId}>
				{(contractId) => (
					<FeeFormFields
						contractId={contractId}
						currentContract={currentContract}
						currentRevenue={currentRevenue}
						form={form}
						state={state}
						title="Editar honorário"
					/>
				)}
			</form.Subscribe>
		</form.Form>
	);
}

interface FeeFormFieldsProps {
	contractId: string;
	currentContract?: ReturnType<
		typeof getFeeEditOptionDefaults
	>["currentContract"];
	currentRevenue?: ReturnType<
		typeof getFeeEditOptionDefaults
	>["currentRevenue"];
	form: ReturnType<typeof useFeeForm>["form"];
	state: OverlayState;
	title: string;
}

function FeeFormFields({
	contractId,
	currentContract,
	currentRevenue,
	form,
	state,
	title,
}: FeeFormFieldsProps) {
	const { contracts, revenues } = useFeeOptions({
		contractId,
		currentContract,
		currentRevenue,
	});

	return (
		<EntityForm state={state} title={title} footer={<form.Submit />}>
			<FormSection>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<form.AppField name="contractId">
						{(field) => (
							<field.Autocomplete
								label="Contrato"
								options={contracts}
								isRequired
								classNames={{
									wrapper: "sm:col-span-2",
								}}
							/>
						)}
					</form.AppField>
					<form.AppField name="revenueId">
						{(field) => (
							<field.Autocomplete
								label="Receita"
								options={revenues}
								isRequired
							/>
						)}
					</form.AppField>
					<form.AppField name="paymentDate">
						{(field) => (
							<field.DatePicker label="Data de pagamento" isRequired />
						)}
					</form.AppField>
					<form.AppField name="installmentNumber">
						{(field) => (
							<field.Number label="Parcela" minValue={1} step={1} isRequired />
						)}
					</form.AppField>
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
			</FormSection>
			<FormSection>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<form.AppField name="generatesRemuneration">
						{(field) => <field.Checkbox label="Gerar remunerações" />}
					</form.AppField>
					<form.AppField name="isActive">
						{(field) => <field.Checkbox label="Ativo" />}
					</form.AppField>
				</FieldGroup>
			</FormSection>
		</EntityForm>
	);
}

function FeeFormSkeleton({
	state,
	title,
}: Pick<FeeFormProps, "state"> & { title: string }) {
	return (
		<EntityForm
			state={state}
			title={title}
			footer={<Skeleton className="h-9 w-28 rounded-md" />}
		>
			<FormSection>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<FormFieldSkeleton labelWidth="w-16" className="sm:col-span-2" />
					<FormFieldSkeleton labelWidth="w-14" />
					<FormFieldSkeleton labelWidth="w-32" />
					<FormFieldSkeleton labelWidth="w-14" />
					<FormFieldSkeleton labelWidth="w-10" />
				</FieldGroup>
			</FormSection>
			<FormSection>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<FormCheckboxSkeleton labelWidth="w-32" />
					<FormCheckboxSkeleton labelWidth="w-10" />
				</FieldGroup>
			</FormSection>
		</EntityForm>
	);
}
