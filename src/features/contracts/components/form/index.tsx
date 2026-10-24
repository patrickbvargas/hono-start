import { TrashIcon } from "lucide-react";
import { Suspense, useRef } from "react";
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
import {
	defaultContractAssignmentValues,
	defaultContractRevenueValues,
} from "../../utils/default";
import { getContractEditOptionDefaults } from "../../utils/edit-options";
import {
	getAssignmentSummary,
	getRevenueSummary,
} from "../../utils/form-summary";

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
	const rowKeysRef = useRef(new WeakMap<object, string>());
	const rowKeyCountRef = useRef(0);
	const session = useLoggedUserSession();
	const isAdmin = hasPermission(session, "org:contracts:update_all");

	const getRowKey = (value: object) => {
		const existingKey = rowKeysRef.current.get(value);
		if (existingKey) {
			return existingKey;
		}

		rowKeyCountRef.current += 1;
		const nextKey = `contract-form-row-${rowKeyCountRef.current}`;
		rowKeysRef.current.set(value, nextKey);
		return nextKey;
	};

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
					<FieldGroup className="grid gap-5 sm:grid-cols-2">
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
									label="% Honorários"
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
					<FieldGroup className="grid gap-5 sm:grid-cols-2">
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
				<FormSection title="Equipe">
					<form.AppField name="assignments" mode="array">
						{(subField) => (
							<div className="space-y-2">
								<ButtonNew
									type="button"
									className="w-fit"
									variant="secondary"
									label="Adicionar colaborador"
									onClick={() =>
										subField.pushValue(defaultContractAssignmentValues())
									}
									disabled={
										subField.state.value.length >= CONTRACT_MAX_EMPLOYEES
									}
								/>
								{subField.state.meta.errors.length > 0 ? (
									<FieldError errors={subField.state.meta.errors} />
								) : null}
								<EntityListAccordion
									items={subField.state.value}
									getKey={(assignment) => getRowKey(assignment)}
									getTitle={(_, index) => `Colaborador ${index + 1}`}
									getSummary={(assignment, index) =>
										getAssignmentSummary(
											assignment,
											index,
											employees,
											assignmentTypes,
										)
									}
									renderContent={(_, index) => (
										<FieldGroup className="grid gap-3 sm:grid-cols-[repeat(2,1fr)_auto]">
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
												variant="destructive"
												className="place-self-end"
												aria-label={`Remover colaborador ${index + 1}`}
												onClick={() => subField.removeValue(index)}
											>
												<TrashIcon size={16} />
											</Button>
										</FieldGroup>
									)}
								/>
							</div>
						)}
					</form.AppField>
				</FormSection>
				<FormSection title="Receitas">
					<form.AppField name="revenues" mode="array">
						{(subField) => (
							<div className="space-y-2">
								<ButtonNew
									type="button"
									className="w-fit"
									variant="secondary"
									label="Adicionar receita"
									onClick={() =>
										subField.pushValue(defaultContractRevenueValues())
									}
									disabled={
										subField.state.value.length >= CONTRACT_MAX_REVENUES
									}
								/>
								{subField.state.meta.errors.length > 0 ? (
									<FieldError errors={subField.state.meta.errors} />
								) : null}
								<EntityListAccordion
									items={subField.state.value}
									getKey={(revenue) => getRowKey(revenue)}
									getTitle={(_, index) => `Receita ${index + 1}`}
									getSummary={(revenue, index) =>
										getRevenueSummary(revenue, index, revenueTypes)
									}
									renderContent={(_, index) => (
										<div className="space-y-3">
											<FieldGroup className="grid gap-3 sm:grid-cols-2">
												<form.AppField name={`revenues[${index}].type`}>
													{(field) => (
														<field.Autocomplete
															label="Tipo"
															options={revenueTypes}
															isRequired
														/>
													)}
												</form.AppField>
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
											</FieldGroup>
											<FieldGroup className="grid gap-3 sm:grid-cols-2">
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
											<FieldGroup className="grid gap-3 sm:grid-cols-2">
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
													variant="destructive"
													className="place-self-end"
													aria-label={`Remover receita ${index + 1}`}
													onClick={() => subField.removeValue(index)}
												>
													<TrashIcon size={16} />
												</Button>
											</FieldGroup>
										</div>
									)}
								/>
							</div>
						)}
					</form.AppField>
				</FormSection>
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
			footer={<Skeleton className="h-9 w-28 rounded-md" />}
		>
			<FormSection>
				<FieldGroup>
					<FormFieldSkeleton labelWidth="w-14" />
				</FieldGroup>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<FormFieldSkeleton labelWidth="w-18" />
					<FormFieldSkeleton labelWidth="w-12" />
					<FormFieldSkeleton labelWidth="w-14" />
					<FormFieldSkeleton labelWidth="w-22" />
				</FieldGroup>
				<FieldGroup>
					<FormTextAreaSkeleton labelWidth="w-22" />
				</FieldGroup>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<FormCheckboxSkeleton labelWidth="w-10" />
					<FormCheckboxSkeleton labelWidth="w-34" />
				</FieldGroup>
			</FormSection>
			<FormSection title="Equipe">
				<Skeleton className="h-8 w-40 rounded-md" />
				<div className="rounded-lg border">
					<div className="flex flex-col gap-1 px-4 py-3 pr-10">
						<Skeleton className="h-4 w-36 rounded-sm" />
						<Skeleton className="h-3 w-52 rounded-sm" />
					</div>
					<div className="px-4 pb-4">
						<FieldGroup className="grid gap-5 sm:grid-cols-[repeat(2,1fr)_auto]">
							<FormFieldSkeleton labelWidth="w-22" />
							<FormFieldSkeleton labelWidth="w-20" />
							<Skeleton className="h-8 w-8 place-self-end rounded-md" />
						</FieldGroup>
					</div>
				</div>
			</FormSection>
			<FormSection title="Receitas">
				<Skeleton className="h-8 w-36 rounded-md" />
				<div className="rounded-lg border">
					<div className="flex flex-col gap-1 px-4 py-3 pr-10">
						<Skeleton className="h-4 w-28 rounded-sm" />
						<Skeleton className="h-3 w-44 rounded-sm" />
					</div>
					<div className="px-4 pb-4">
						<FieldGroup className="grid items-end gap-5 sm:grid-cols-[1fr_1fr_auto]">
							<FormFieldSkeleton labelWidth="w-24" />
							<FormFieldSkeleton labelWidth="w-28" />
							<Skeleton className="h-8 w-8 place-self-end rounded-md" />
						</FieldGroup>
						<FieldGroup className="grid gap-5 sm:grid-cols-2">
							<FormFieldSkeleton labelWidth="w-20" />
							<FormFieldSkeleton labelWidth="w-14" />
						</FieldGroup>
						<FieldGroup className="grid gap-5 sm:grid-cols-2">
							<FormFieldSkeleton labelWidth="w-16" />
						</FieldGroup>
						<FieldGroup>
							<FormCheckboxSkeleton labelWidth="w-24" />
						</FieldGroup>
					</div>
				</div>
			</FormSection>
		</EntityForm>
	);
}
