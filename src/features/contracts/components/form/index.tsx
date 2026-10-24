import { TrashIcon } from "lucide-react";
import { Suspense } from "react";
import { ButtonNew } from "@/shared/components/button-new";
import { EntityForm } from "@/shared/components/entity-form";
import { EntityListAccordion } from "@/shared/components/entity-list-accordion";
import {
	FormCheckboxSkeleton,
	FormFieldSkeleton,
	FormTextAreaSkeleton,
} from "@/shared/components/form-field-skeleton";
import { FormSection } from "@/shared/components/form-section";
import {
	Button,
	FieldError,
	FieldGroup,
	Skeleton,
} from "@/shared/components/ui";
import { TEXT_LIMITS } from "@/shared/constants/text-limits";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import {
	CONTRACT_MAX_EMPLOYEES,
	CONTRACT_MAX_REVENUES,
} from "../../constants/values";
import { useContract, useContractOptions } from "../../hooks/use-data";
import { useContractForm } from "../../hooks/use-form";
import { useContractFormSections } from "../../hooks/use-form-sections";
import {
	defaultContractAssignmentValues,
	defaultContractRevenueValues,
} from "../../utils/default";
import { getContractEditOptionDefaults } from "../../utils/edit-options";
import { getRevenueSummary } from "../../utils/form-summary";

interface ContractFormProps {
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ContractForm = ({ id, state, onSuccess }: ContractFormProps) => {
	const title = id ? "Editar contrato" : "Novo contrato";

	return (
		<Suspense fallback={<ContractFormSkeleton state={state} title={title} />}>
			{id ? (
				<EditContractFormContent id={id} state={state} onSuccess={onSuccess} />
			) : (
				<CreateContractFormContent state={state} onSuccess={onSuccess} />
			)}
		</Suspense>
	);
};

function CreateContractFormContent({
	state,
	onSuccess,
}: Omit<ContractFormProps, "id">) {
	const options = useContractOptions();
	const { form } = useContractForm({ onSuccess });

	return (
		<ContractFormContent
			form={form}
			state={state}
			title="Novo contrato"
			{...options}
		/>
	);
}

function EditContractFormContent({
	id,
	state,
	onSuccess,
}: Required<Pick<ContractFormProps, "id">> & Omit<ContractFormProps, "id">) {
	const { contract } = useContract(id);
	const options = useContractOptions(getContractEditOptionDefaults(contract));
	const { form } = useContractForm({
		id,
		initialValue: contract,
		onSuccess,
	});

	return (
		<ContractFormContent
			form={form}
			state={state}
			title="Editar contrato"
			{...options}
		/>
	);
}

interface ContractFormContentProps
	extends Pick<ContractFormProps, "state">,
		ReturnType<typeof useContractOptions> {
	form: ReturnType<typeof useContractForm>["form"];
	title: string;
}

function ContractFormContent({
	state,
	form,
	title,
	clients,
	legalAreas,
	statuses,
	assignmentTypes,
	revenueTypes,
	employees,
}: ContractFormContentProps) {
	const session = useLoggedUserSession();
	const isAdmin = hasPermission(session, "org:contracts:update_all");
	const {
		getRowKey,
		focusAddedRow,
		removeRowKey,
		isRevenueRequiredOpen,
		submissionAttempts,
	} = useContractFormSections({ form });

	return (
		<form.Form form={form}>
			<EntityForm state={state} title={title} footer={<form.Submit />}>
				<FormSection>
					<FieldGroup>
						<form.AppField name="clientId">
							{(field) => (
								<field.Autocomplete
									label="Cliente"
									options={clients}
									isRequired
								/>
							)}
						</form.AppField>
					</FieldGroup>
					<FieldGroup className="grid gap-4 sm:grid-cols-2">
						<form.AppField name="processNumber">
							{(field) => (
								<field.Input
									label="Processo"
									maxLength={TEXT_LIMITS.processNumber}
									isRequired
								/>
							)}
						</form.AppField>
						<form.AppField name="legalArea">
							{(field) => (
								<field.Autocomplete
									label="Área"
									options={legalAreas}
									isRequired
								/>
							)}
						</form.AppField>
						<form.AppField name="status">
							{(field) => (
								<field.Autocomplete
									label="Andamento"
									options={statuses}
									isRequired
								/>
							)}
						</form.AppField>
						<form.AppField name="feePercentage">
							{(field) => (
								<field.Number
									label="Honorários (%)"
									minValue={0}
									maxValue={1}
									step={0.01}
									isRequired
									formatOptions={{ style: "percent" }}
								/>
							)}
						</form.AppField>
					</FieldGroup>
					<FieldGroup>
						<form.AppField name="notes">
							{(field) => (
								<field.Textarea
									label="Observações"
									maxLength={TEXT_LIMITS.notes}
								/>
							)}
						</form.AppField>
					</FieldGroup>
				</FormSection>
				<FormSection title="Opções">
					<FieldGroup className="grid gap-4 sm:grid-cols-2">
						<form.AppField name="isActive">
							{(field) => <field.Checkbox label="Ativo" />}
						</form.AppField>
						{isAdmin ? (
							<form.AppField name="allowStatusChange">
								{(field) => (
									<field.Checkbox label="Permitir mudança de status" />
								)}
							</form.AppField>
						) : null}
					</FieldGroup>
				</FormSection>
				<form.AppField name="assignments" mode="array">
					{(subField) => (
						<FormSection
							title="Equipe"
							action={
								<ButtonNew
									type="button"
									className="w-fit"
									variant="ghost"
									size="sm"
									label="Adicionar colaborador"
									onClick={() => {
										const index = subField.state.value.length;
										subField.pushValue(defaultContractAssignmentValues());
										focusAddedRow("assignments", index);
									}}
									disabled={
										subField.state.value.length >= CONTRACT_MAX_EMPLOYEES
									}
								/>
							}
						>
							{subField.state.meta.errors.length > 0 ? (
								<FieldError errors={subField.state.meta.errors} />
							) : null}
							{subField.state.value.map((_, index) => (
								<div
									key={getRowKey("assignments", index)}
									data-contract-row={getRowKey("assignments", index)}
									className="border-b pb-3 last:border-0 last:pb-0"
								>
									<FieldGroup className="grid gap-4 sm:grid-cols-[repeat(2,1fr)_auto]">
										<form.AppField name={`assignments[${index}].employeeId`}>
											{(field) => (
												<field.Autocomplete
													label="Colaborador"
													options={employees}
													isRequired
												/>
											)}
										</form.AppField>
										<form.AppField
											name={`assignments[${index}].assignmentType`}
										>
											{(field) => (
												<field.Autocomplete
													label="Atribuição"
													options={assignmentTypes}
													isRequired
												/>
											)}
										</form.AppField>
										<Button
											type="button"
											size="icon"
											variant="outline"
											className="place-self-end"
											aria-label={`Remover colaborador ${index + 1}`}
											onClick={() => {
												removeRowKey("assignments", index);
												subField.removeValue(index);
											}}
										>
											<TrashIcon size={16} />
										</Button>
									</FieldGroup>
								</div>
							))}
						</FormSection>
					)}
				</form.AppField>
				<form.AppField name="revenues" mode="array">
					{(subField) => (
						<FormSection
							title="Receitas"
							action={
								<ButtonNew
									type="button"
									className="w-fit"
									variant="ghost"
									size="sm"
									label="Adicionar receita"
									onClick={() => {
										const index = subField.state.value.length;
										subField.pushValue(defaultContractRevenueValues());
										focusAddedRow("revenues", index);
									}}
									disabled={
										subField.state.value.length >= CONTRACT_MAX_REVENUES
									}
								/>
							}
						>
							{subField.state.meta.errors.length > 0 ? (
								<FieldError errors={subField.state.meta.errors} />
							) : null}
							<EntityListAccordion
								items={subField.state.value}
								getKey={(_, index) => getRowKey("revenues", index)}
								isItemAutoOpen={isRevenueRequiredOpen}
								autoOpenRevision={submissionAttempts}
								getTitle={(_, index) => `Receita ${index + 1}`}
								getSummary={(revenue, index) =>
									getRevenueSummary(revenue, index, revenueTypes)
								}
								renderContent={(_, index) => (
									<div
										data-contract-row={getRowKey("revenues", index)}
										className="space-y-4"
									>
										<FieldGroup className="grid gap-4 sm:grid-cols-2">
											<form.AppField name={`revenues[${index}].type`}>
												{(field) => (
													<field.Autocomplete
														label="Tipo"
														options={revenueTypes}
														isRequired
													/>
												)}
											</form.AppField>
											<form.AppField name={`revenues[${index}].totalValue`}>
												{(field) => (
													<field.Number
														label="Valor total"
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
											<form.AppField
												name={`revenues[${index}].paymentStartDate`}
											>
												{(field) => (
													<field.DatePicker
														label="Início do pagamento"
														isRequired
													/>
												)}
											</form.AppField>
											<form.AppField
												name={`revenues[${index}].downPaymentValue`}
											>
												{(field) => (
													<field.Number
														label="Entrada"
														minValue={0}
														step={0.01}
														formatOptions={{
															style: "currency",
															currency: "BRL",
														}}
													/>
												)}
											</form.AppField>
										</FieldGroup>
										<FieldGroup className="grid gap-4 sm:grid-cols-2">
											<form.AppField
												name={`revenues[${index}].totalInstallments`}
											>
												{(field) => (
													<field.Number
														label="Parcelas"
														minValue={1}
														step={1}
														isRequired
													/>
												)}
											</form.AppField>
											<Button
												type="button"
												size="icon"
												variant="outline"
												className="place-self-end"
												aria-label={`Remover receita ${index + 1}`}
												onClick={() => {
													removeRowKey("revenues", index);
													subField.removeValue(index);
												}}
											>
												<TrashIcon size={16} />
											</Button>
										</FieldGroup>
									</div>
								)}
							/>
						</FormSection>
					)}
				</form.AppField>
			</EntityForm>
		</form.Form>
	);
}

function ContractFormSkeleton({
	state,
	title,
}: Pick<ContractFormProps, "state"> & { title: string }) {
	return (
		<EntityForm
			state={state}
			title={title}
			footer={<Skeleton className="h-8 w-16 rounded-lg" />}
		>
			<FormSection>
				<FieldGroup>
					<FormFieldSkeleton labelWidth="w-14" />
				</FieldGroup>
				<FieldGroup className="grid gap-4 sm:grid-cols-2">
					<FormFieldSkeleton labelWidth="w-18" />
					<FormFieldSkeleton labelWidth="w-12" />
					<FormFieldSkeleton labelWidth="w-14" />
					<FormFieldSkeleton labelWidth="w-22" />
				</FieldGroup>
				<FieldGroup>
					<FormTextAreaSkeleton labelWidth="w-22" />
				</FieldGroup>
			</FormSection>
			<FormSection title="Opções">
				<FieldGroup className="grid gap-4 sm:grid-cols-2">
					<FormCheckboxSkeleton labelWidth="w-10" />
					<FormCheckboxSkeleton labelWidth="w-34" />
				</FieldGroup>
			</FormSection>
			<FormSection
				title="Equipe"
				action={<Skeleton className="h-7 w-40 rounded-md" />}
			>
				<div>
					<div className="pb-3">
						<FieldGroup className="grid gap-4 sm:grid-cols-[repeat(2,1fr)_auto]">
							<FormFieldSkeleton labelWidth="w-22" />
							<FormFieldSkeleton labelWidth="w-20" />
							<Skeleton className="h-8 w-8 place-self-end rounded-md" />
						</FieldGroup>
					</div>
				</div>
			</FormSection>
			<FormSection
				title="Receitas"
				action={<Skeleton className="h-7 w-36 rounded-md" />}
			>
				<div className="rounded-lg border">
					<div className="flex flex-col gap-1 px-4 py-3 pr-10">
						<Skeleton className="h-4 w-28 rounded-sm" />
						<Skeleton className="h-3 w-44 rounded-sm" />
					</div>
					<div className="space-y-4 px-4 pb-4">
						<FieldGroup className="grid gap-4 sm:grid-cols-2">
							<FormFieldSkeleton labelWidth="w-12" />
							<FormFieldSkeleton labelWidth="w-20" />
						</FieldGroup>
						<FieldGroup className="grid gap-4 sm:grid-cols-2">
							<FormFieldSkeleton labelWidth="w-32" />
							<FormFieldSkeleton labelWidth="w-14" />
						</FieldGroup>
						<FieldGroup className="grid gap-4 sm:grid-cols-2">
							<FormFieldSkeleton labelWidth="w-16" />
							<Skeleton className="size-8 place-self-end rounded-lg" />
						</FieldGroup>
					</div>
				</div>
			</FormSection>
		</EntityForm>
	);
}
