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
import { useFee, useFeeFormOptions } from "../../hooks/use-data";
import { useFeeForm } from "../../hooks/use-form";
import { getFeeEditOptionDefaults } from "../../utils/edit-options";

interface FeeFormProps {
	initialSelection?: {
		contractId: string;
		revenueId: string;
		installmentNumber?: number;
	};
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const FeeForm = ({
	id,
	state,
	onSuccess,
	initialSelection,
}: FeeFormProps) => {
	const title = id ? "Editar recebimento" : "Novo recebimento";

	return (
		<Suspense fallback={<FeeFormSkeleton state={state} title={title} />}>
			{id ? (
				<EditFeeFormContent id={id} state={state} onSuccess={onSuccess} />
			) : (
				<CreateFeeFormContent
					state={state}
					onSuccess={onSuccess}
					initialSelection={initialSelection}
				/>
			)}
		</Suspense>
	);
};

function CreateFeeFormContent({
	state,
	onSuccess,
	initialSelection,
}: Omit<FeeFormProps, "id">) {
	const { form } = useFeeForm({ onSuccess, initialSelection });

	return (
		<form.Form form={form}>
			<form.Subscribe selector={(current) => current.values.contractId}>
				{(contractId) => (
					<FeeFormFields
						contractId={contractId}
						form={form}
						state={state}
						title="Novo recebimento"
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
		<form.Form form={form}>
			<form.Subscribe selector={(current) => current.values.contractId}>
				{(contractId) => (
					<FeeFormFields
						contractId={contractId}
						currentContract={currentContract}
						currentRevenue={currentRevenue}
						form={form}
						state={state}
						title="Editar recebimento"
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
	const { contracts, revenues, isLoadingRevenues, revenueInstallmentLimits } =
		useFeeFormOptions({
			contractId,
			currentContract,
			currentRevenue,
		});

	return (
		<EntityForm state={state} title={title} footer={<form.Submit />}>
			<FormSection variant="plain">
				<FieldGroup className="grid gap-4 sm:grid-cols-2">
					<form.AppField
						name="contractId"
						listeners={{
							onChange: () => {
								form.setFieldValue("revenueId", "");
							},
						}}
					>
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
								isDisabled={!contractId || isLoadingRevenues}
								placeholder={
									isLoadingRevenues
										? "Carregando receitas..."
										: contractId
											? "Selecionar item..."
											: "Selecione um contrato primeiro"
								}
							/>
						)}
					</form.AppField>
					<form.AppField name="paymentDate">
						{(field) => (
							<field.DatePicker label="Data de recebimento" isRequired />
						)}
					</form.AppField>
					<form.Subscribe selector={(current) => current.values.revenueId}>
						{(revenueId) => (
							<form.AppField name="installmentNumber">
								{(field) => (
									<field.Number
										label="Nº da parcela"
										maxValue={revenueInstallmentLimits.get(revenueId)}
										minValue={1}
										step={1}
										isRequired
									/>
								)}
							</form.AppField>
						)}
					</form.Subscribe>
					<form.AppField name="amount">
						{(field) => (
							<field.Number
								label="Valor"
								minValue={0}
								step={0.01}
								isRequired
								formatOptions={{
									style: "currency",
									currency: "BRL",
								}}
							/>
						)}
					</form.AppField>
				</FieldGroup>
				<FieldGroup className="grid gap-4 sm:grid-cols-2">
					<form.AppField name="generatesRemuneration">
						{(field) => <field.Checkbox label="Gerar remunerações" />}
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
			isLoading
			footer={<Skeleton className="h-8 w-16 rounded-lg" />}
		>
			<FormSection variant="plain">
				<FieldGroup className="grid gap-4 sm:grid-cols-2">
					<FormFieldSkeleton labelWidth="w-16" className="sm:col-span-2" />
					<FormFieldSkeleton labelWidth="w-14" />
					<FormFieldSkeleton labelWidth="w-32" />
					<FormFieldSkeleton labelWidth="w-14" />
					<FormFieldSkeleton labelWidth="w-10" />
				</FieldGroup>
				<FieldGroup className="grid gap-4 sm:grid-cols-2">
					<FormCheckboxSkeleton labelWidth="w-32" />
				</FieldGroup>
			</FormSection>
		</EntityForm>
	);
}
