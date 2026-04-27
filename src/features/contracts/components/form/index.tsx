import { PlusIcon, Trash2Icon } from "lucide-react";
import { useRef } from "react";
import { EntityForm } from "@/shared/components/entity-form";
import { EntityFormList } from "@/shared/components/entity-form-list";
import { FormSection } from "@/shared/components/form-section";
import {
	Button,
	FieldError,
	FieldGroup,
	ScrollArea,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { Option } from "@/shared/schemas/option";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import {
	CONTRACT_MAX_EMPLOYEES,
	CONTRACT_MAX_REVENUES,
} from "../../constants/values";
import { useContractOptions } from "../../hooks/use-data";
import { useContractForm } from "../../hooks/use-form";
import type {
	ContractAssignmentInput,
	ContractRevenueInput,
} from "../../schemas/form";
import {
	defaultContractAssignmentValues,
	defaultContractRevenueValues,
} from "../../utils/default";

interface ContractFormProps {
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

function getAssignmentSummary(
	assignment: ContractAssignmentInput,
	index: number,
	employees: Option[],
	assignmentTypes: Option[],
) {
	const employeeLabel = assignment.employeeId.trim()
		? (employees.find((option) => option.value === assignment.employeeId)
				?.label ?? `Colaborador #${assignment.employeeId}`)
		: `Colaborador ${index + 1}`;
	const assignmentTypeLabel = assignment.assignmentType.trim()
		? (assignmentTypes.find(
				(option) => option.value === assignment.assignmentType,
			)?.label ?? assignment.assignmentType)
		: "Atribuição pendente";

	return `${employeeLabel} • ${assignmentTypeLabel}`;
}

function getRevenueSummary(
	revenue: ContractRevenueInput,
	index: number,
	revenueTypes: Option[],
) {
	const typeLabel = revenue.type.trim()
		? (revenueTypes.find((option) => option.value === revenue.type)?.label ??
			revenue.type)
		: `Receita ${index + 1}`;
	const totalValue =
		revenue.totalValue > 0
			? formatter.currency(revenue.totalValue)
			: "Valor pendente";

	return `${typeLabel} • ${totalValue} • ${revenue.totalInstallments} parcela(s)`;
}

export const ContractForm = ({ id, state, onSuccess }: ContractFormProps) => {
	const rowKeysRef = useRef(new WeakMap<object, string>());
	const rowKeyCountRef = useRef(0);
	const {
		clients,
		legalAreas,
		statuses,
		assignmentTypes,
		revenueTypes,
		employees,
	} = useContractOptions();
	const { form } = useContractForm({ id, onSuccess });
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

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

	const title = id ? "Editar contrato" : "Novo contrato";

	return (
		<form.Form form={form}>
			<EntityForm
				state={state}
				title={title}
				footer={<form.Submit />}
				contentClassName="sm:max-w-4xl"
			>
				<ScrollArea className="max-h-[min(70vh,calc(100dvh-12rem))]">
					<div className="flex flex-col gap-6 pr-3">
						<FormSection title="Dados do contrato">
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
									{(field) => <field.Input label="Processo" isRequired />}
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
											label="Status"
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
									{(field) => <field.Textarea label="Observações" />}
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

						<FormSection
							title="Colaboradores"
							description={`Até ${CONTRACT_MAX_EMPLOYEES} colaboradores por contrato.`}
						>
							<form.AppField name="assignments" mode="array">
								{(subField) => (
									<>
										<Button
											type="button"
											size="sm"
											className="w-fit"
											onClick={() =>
												subField.pushValue(defaultContractAssignmentValues())
											}
											disabled={
												subField.state.value.length >= CONTRACT_MAX_EMPLOYEES
											}
										>
											<PlusIcon size={16} />
											Adicionar colaborador
										</Button>
										{subField.state.meta.errors.length > 0 ? (
											<FieldError errors={subField.state.meta.errors} />
										) : null}
										{subField.state.value.length === 0 ? (
											<p className="text-muted-foreground text-sm">
												Adicione pelo menos um colaborador.
											</p>
										) : (
											<EntityFormList
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
												getDescription={() =>
													"Defina colaborador e atribuição para manter o contrato editável."
												}
												renderContent={(_, i) => (
													<FieldGroup className="grid gap-5 sm:grid-cols-[repeat(2,1fr)_auto]">
														<form.AppField
															name={`assignments[${i}].employeeId`}
														>
															{(field) => (
																<field.Autocomplete
																	label="Colaborador"
																	options={employees}
																	isRequired
																/>
															)}
														</form.AppField>
														<form.AppField
															name={`assignments[${i}].assignmentType`}
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
															size="icon-sm"
															variant="destructive"
															className="place-self-end"
															aria-label={`Remover colaborador ${i + 1}`}
															onClick={() => subField.removeValue(i)}
														>
															<Trash2Icon size={16} />
														</Button>
													</FieldGroup>
												)}
											/>
										)}
									</>
								)}
							</form.AppField>
						</FormSection>

						<FormSection
							title="Receitas"
							description={`Até ${CONTRACT_MAX_REVENUES} receitas ativas por contrato.`}
						>
							<form.AppField name="revenues" mode="array">
								{(subField) => (
									<>
										<Button
											type="button"
											size="sm"
											className="w-fit"
											onClick={() =>
												subField.pushValue(defaultContractRevenueValues())
											}
											disabled={
												subField.state.value.length >= CONTRACT_MAX_REVENUES
											}
										>
											<PlusIcon size={16} />
											Adicionar receita
										</Button>
										{subField.state.meta.errors.length > 0 ? (
											<FieldError errors={subField.state.meta.errors} />
										) : null}
										{subField.state.value.length === 0 ? (
											<p className="text-muted-foreground text-sm">
												Adicione pelo menos uma receita.
											</p>
										) : (
											<EntityFormList
												items={subField.state.value}
												getKey={(revenue) => getRowKey(revenue)}
												getTitle={(_, index) => `Receita ${index + 1}`}
												getSummary={(revenue, index) =>
													getRevenueSummary(revenue, index, revenueTypes)
												}
												getDescription={(revenue) =>
													revenue.paymentStartDate
														? `Início ${formatter.date(revenue.paymentStartDate)}`
														: "Defina tipo, valor e cronograma de pagamento."
												}
												renderContent={(_, i) => (
													<>
														<FieldGroup className="grid items-end gap-5 sm:grid-cols-[1fr_1fr_auto]">
															<form.AppField name={`revenues[${i}].type`}>
																{(field) => (
																	<field.Autocomplete
																		label="Tipo de receita"
																		options={revenueTypes}
																		isRequired
																	/>
																)}
															</form.AppField>
															<form.AppField
																name={`revenues[${i}].paymentStartDate`}
															>
																{(field) => (
																	<field.Input
																		label="Início do pagamento"
																		type="date"
																		isRequired
																	/>
																)}
															</form.AppField>
															<Button
																type="button"
																size="icon-sm"
																variant="destructive"
																className="place-self-end"
																aria-label={`Remover receita ${i + 1}`}
																onClick={() => subField.removeValue(i)}
															>
																<Trash2Icon size={16} />
															</Button>
														</FieldGroup>
														<FieldGroup className="grid gap-5 sm:grid-cols-3">
															<form.AppField name={`revenues[${i}].totalValue`}>
																{(field) => (
																	<field.Number
																		label="Valor total"
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
															<form.AppField
																name={`revenues[${i}].downPaymentValue`}
															>
																{(field) => (
																	<field.Number
																		label="Entrada"
																		minValue={0}
																		step={100}
																		formatOptions={{
																			style: "currency",
																			currency: "BRL",
																		}}
																	/>
																)}
															</form.AppField>
															<form.AppField
																name={`revenues[${i}].totalInstallments`}
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
														</FieldGroup>
														<FieldGroup>
															<form.AppField name={`revenues[${i}].isActive`}>
																{(field) => (
																	<field.Checkbox label="Receita ativa" />
																)}
															</form.AppField>
														</FieldGroup>
													</>
												)}
											/>
										)}
									</>
								)}
							</form.AppField>
						</FormSection>
					</div>
				</ScrollArea>
			</EntityForm>
		</form.Form>
	);
};
