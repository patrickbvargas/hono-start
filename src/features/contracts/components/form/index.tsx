import { AlertCircleIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { FormWrapper } from "@/shared/components/form-wrapper";
import { Button, Field, Tabs } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import {
	CONTRACT_MAX_EMPLOYEES,
	CONTRACT_MAX_REVENUES,
} from "../../constants/values";
import { useContractForm } from "../../hooks/use-form";
import { useContractOptions } from "../../hooks/use-options";
import {
	defaultContractAssignmentValues,
	defaultContractRevenueValues,
} from "../../utils/default";

const CONTRACT_FORM_TABS = {
	data: "data",
	assignments: "assignments",
	revenues: "revenues",
} as const;

interface ContractFormProps {
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

interface ContractFormTabErrors {
	data: boolean;
	assignments: boolean;
	revenues: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasValidationError(value: unknown): boolean {
	if (!value) {
		return false;
	}

	if (typeof value === "string") {
		return value.length > 0;
	}

	if (Array.isArray(value)) {
		return value.some((item) => hasValidationError(item));
	}

	if (isRecord(value)) {
		return Object.values(value).some((item) => hasValidationError(item));
	}

	return true;
}

function formatIssuePath(path: unknown): string | null {
	if (typeof path === "string") {
		return path;
	}

	if (Array.isArray(path)) {
		return path.map(String).join(".");
	}

	return null;
}

function collectErrorPaths(value: unknown): string[] {
	const paths: string[] = [];

	function visit(item: unknown, fallbackPath?: string): void {
		if (!hasValidationError(item)) {
			return;
		}

		if (isRecord(item)) {
			const issuePath = formatIssuePath(item.path);
			if (issuePath) {
				paths.push(issuePath);
				return;
			}

			for (const [key, child] of Object.entries(item)) {
				visit(child, key);
			}
			return;
		}

		if (Array.isArray(item)) {
			for (const child of item) {
				visit(child, fallbackPath);
			}
			return;
		}

		if (fallbackPath) {
			paths.push(fallbackPath);
		}
	}

	visit(value);
	return paths;
}

function collectFieldMetaErrorPaths(fieldMetaBase: unknown): string[] {
	if (!isRecord(fieldMetaBase)) {
		return [];
	}

	return Object.entries(fieldMetaBase)
		.filter(([, meta]) => {
			if (!isRecord(meta)) {
				return false;
			}

			return hasValidationError(meta.errorMap);
		})
		.map(([path]) => path);
}

function normalizeErrorPath(path: string): string {
	return path.replaceAll(/\[(\d+)\]/g, ".$1");
}

function isSectionPath(path: string, section: "assignments" | "revenues") {
	const normalizedPath = normalizeErrorPath(path);
	return normalizedPath === section || normalizedPath.startsWith(`${section}.`);
}

function getContractFormTabErrors(formState: {
	errorMap: unknown;
	errors: unknown;
	fieldMetaBase: unknown;
	isSubmitSuccessful: boolean;
	submissionAttempts: number;
}): ContractFormTabErrors {
	if (formState.submissionAttempts === 0 || formState.isSubmitSuccessful) {
		return { data: false, assignments: false, revenues: false };
	}

	const paths = [
		...collectErrorPaths(formState.errorMap),
		...collectErrorPaths(formState.errors),
		...collectFieldMetaErrorPaths(formState.fieldMetaBase),
	];
	const hasAssignmentsError = paths.some((path) =>
		isSectionPath(path, CONTRACT_FORM_TABS.assignments),
	);
	const hasRevenuesError = paths.some((path) =>
		isSectionPath(path, CONTRACT_FORM_TABS.revenues),
	);
	const hasKnownPath = paths.length > 0;

	return {
		data:
			hasKnownPath &&
			paths.some(
				(path) =>
					!isSectionPath(path, CONTRACT_FORM_TABS.assignments) &&
					!isSectionPath(path, CONTRACT_FORM_TABS.revenues),
			),
		assignments: hasAssignmentsError,
		revenues: hasRevenuesError,
	};
}

function TabLabel({
	children,
	hasError,
}: {
	children: React.ReactNode;
	hasError: boolean;
}) {
	return (
		<span className="inline-flex items-center gap-1.5">
			<span>{children}</span>
			{hasError ? (
				<AlertCircleIcon
					aria-label="Há erros nesta seção"
					className="text-danger"
					size={14}
				/>
			) : null}
		</span>
	);
}

function HiddenErrorMessage({
	activeTab,
	errors,
}: {
	activeTab: string;
	errors: ContractFormTabErrors;
}) {
	const hiddenErrorLabels = [
		activeTab !== CONTRACT_FORM_TABS.data && errors.data ? "Dados" : null,
		activeTab !== CONTRACT_FORM_TABS.assignments && errors.assignments
			? "Colaboradores"
			: null,
		activeTab !== CONTRACT_FORM_TABS.revenues && errors.revenues
			? "Receitas"
			: null,
	].filter((label) => label !== null);

	if (hiddenErrorLabels.length === 0) {
		return null;
	}

	return (
		<p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-danger text-sm">
			Revise também: {hiddenErrorLabels.join(", ")}.
		</p>
	);
}

export const ContractForm = ({ id, state, onSuccess }: ContractFormProps) => {
	const rowKeysRef = useRef(new WeakMap<object, string>());
	const rowKeyCountRef = useRef(0);
	const [activeTab, setActiveTab] = useState<string>(CONTRACT_FORM_TABS.data);
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
			<FormWrapper state={state} title={title} footer={<form.Submit />}>
				<form.Subscribe
					selector={(formState) => ({
						assignmentCount: formState.values.assignments.length,
						errorMap: formState.errorMap,
						errors: formState.errors,
						fieldMetaBase: formState.fieldMetaBase,
						isSubmitSuccessful: formState.isSubmitSuccessful,
						revenueCount: formState.values.revenues.length,
						submissionAttempts: formState.submissionAttempts,
					})}
				>
					{(formState) => {
						const tabErrors = getContractFormTabErrors(formState);

						return (
							<Tabs
								className="w-full"
								selectedKey={activeTab}
								variant="secondary"
								onSelectionChange={(key) => setActiveTab(String(key))}
							>
								<Tabs.ListContainer>
									<Tabs.List aria-label="Seções do contrato">
										<Tabs.Tab id={CONTRACT_FORM_TABS.data}>
											<TabLabel hasError={tabErrors.data}>Dados</TabLabel>
											<Tabs.Indicator />
										</Tabs.Tab>
										<Tabs.Tab id={CONTRACT_FORM_TABS.assignments}>
											<TabLabel hasError={tabErrors.assignments}>
												Colaboradores ({formState.assignmentCount})
											</TabLabel>
											<Tabs.Indicator />
										</Tabs.Tab>
										<Tabs.Tab id={CONTRACT_FORM_TABS.revenues}>
											<TabLabel hasError={tabErrors.revenues}>
												Receitas ({formState.revenueCount})
											</TabLabel>
											<Tabs.Indicator />
										</Tabs.Tab>
									</Tabs.List>
								</Tabs.ListContainer>
								<div className="pt-3">
									<HiddenErrorMessage
										activeTab={activeTab}
										errors={tabErrors}
									/>
								</div>
								<Tabs.Panel
									className="flex flex-col gap-2.5 pt-3"
									id={CONTRACT_FORM_TABS.data}
								>
									<Field.Group>
										<form.AppField name="clientId">
											{(field) => (
												<field.Autocomplete
													label="Cliente"
													options={clients}
													variant="secondary"
													isRequired
												/>
											)}
										</form.AppField>
									</Field.Group>
									<Field.Group className="grid-cols-2">
										<form.AppField name="processNumber">
											{(field) => (
												<field.Input
													label="Processo"
													variant="secondary"
													isRequired
												/>
											)}
										</form.AppField>
										<form.AppField name="legalArea">
											{(field) => (
												<field.Autocomplete
													label="Área"
													options={legalAreas}
													variant="secondary"
													isRequired
												/>
											)}
										</form.AppField>
										<form.AppField name="status">
											{(field) => (
												<field.Autocomplete
													label="Status"
													options={statuses}
													variant="secondary"
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
													variant="secondary"
													isRequired
													fullWidth
													formatOptions={{ style: "percent" }}
												/>
											)}
										</form.AppField>
									</Field.Group>
									<Field.Group>
										<form.AppField name="notes">
											{(field) => (
												<field.Textarea
													label="Observações"
													variant="secondary"
												/>
											)}
										</form.AppField>
									</Field.Group>
									<Field.Group className="grid-cols-2">
										<form.AppField name="isActive">
											{(field) => (
												<field.Checkbox label="Ativo" variant="secondary" />
											)}
										</form.AppField>
										{isAdmin ? (
											<form.AppField name="allowStatusChange">
												{(field) => (
													<field.Checkbox
														label="Permitir mudança de status"
														variant="secondary"
													/>
												)}
											</form.AppField>
										) : null}
									</Field.Group>
								</Tabs.Panel>
								<Tabs.Panel
									className="flex flex-col gap-2.5 pt-3"
									id={CONTRACT_FORM_TABS.assignments}
								>
									<form.AppField name="assignments" mode="array">
										{(subField) => (
											<Field.Group>
												<Button
													size="sm"
													variant="secondary"
													onPress={() =>
														subField.pushValue(
															defaultContractAssignmentValues(),
														)
													}
													isDisabled={
														subField.state.value.length >=
														CONTRACT_MAX_EMPLOYEES
													}
												>
													<PlusIcon size={16} />
													Colaborador
												</Button>
												{subField.state.value.map((assignment, i) => (
													<Field.Group
														key={getRowKey(assignment)}
														className="grid-cols-[repeat(2,1fr)_auto]"
													>
														<form.AppField
															name={`assignments[${i}].employeeId`}
														>
															{(field) => (
																<field.Autocomplete
																	label="Colaborador"
																	options={employees}
																	variant="secondary"
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
																	variant="secondary"
																	isRequired
																/>
															)}
														</form.AppField>
														<Button
															isIconOnly
															variant="danger-soft"
															className="place-self-end"
															onPress={() => subField.removeValue(i)}
														>
															<Trash2Icon size={16} />
														</Button>
													</Field.Group>
												))}
											</Field.Group>
										)}
									</form.AppField>
								</Tabs.Panel>
								<Tabs.Panel
									className="flex flex-col gap-2.5 pt-3"
									id={CONTRACT_FORM_TABS.revenues}
								>
									<form.AppField name="revenues" mode="array">
										{(subField) => (
											<Field.Group>
												<Button
													size="sm"
													variant="secondary"
													onPress={() =>
														subField.pushValue(defaultContractRevenueValues())
													}
													isDisabled={
														subField.state.value.length >= CONTRACT_MAX_REVENUES
													}
												>
													<PlusIcon size={16} />
													Receita
												</Button>
												{subField.state.value.map((revenue, i) => (
													<Field.Group key={getRowKey(revenue)}>
														<Field.Group className="grid-cols-[1fr_1fr_auto] items-end">
															<form.AppField name={`revenues[${i}].type`}>
																{(field) => (
																	<field.Autocomplete
																		label="Tipo de receita"
																		options={revenueTypes}
																		variant="secondary"
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
																		variant="secondary"
																		isRequired
																	/>
																)}
															</form.AppField>
														</Field.Group>
														<Field.Group className="grid-cols-3">
															<form.AppField name={`revenues[${i}].totalValue`}>
																{(field) => (
																	<field.Number
																		label="Valor total"
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
															<form.AppField
																name={`revenues[${i}].downPaymentValue`}
															>
																{(field) => (
																	<field.Number
																		label="Entrada"
																		minValue={0}
																		step={100}
																		variant="secondary"
																		fullWidth
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
																		variant="secondary"
																		isRequired
																		fullWidth
																	/>
																)}
															</form.AppField>
														</Field.Group>
														<form.AppField name={`revenues[${i}].isActive`}>
															{(field) => (
																<field.Checkbox label="Receita ativa" />
															)}
														</form.AppField>
														<Button
															isIconOnly
															variant="danger-soft"
															className="place-self-end"
															onPress={() => subField.removeValue(i)}
														>
															<Trash2Icon size={16} />
														</Button>
													</Field.Group>
												))}
											</Field.Group>
										)}
									</form.AppField>
								</Tabs.Panel>
							</Tabs>
						);
					}}
				</form.Subscribe>
			</FormWrapper>
		</form.Form>
	);
};
