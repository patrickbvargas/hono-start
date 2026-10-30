import { Suspense } from "react";
import { EntityForm } from "@/shared/components/entity-form";
import {
	FormCheckboxSkeleton,
	FormFieldSkeleton,
} from "@/shared/components/form-field-skeleton";
import { FormSection } from "@/shared/components/form-section";
import { FieldGroup, Skeleton } from "@/shared/components/ui";
import { TEXT_LIMITS } from "@/shared/constants/text-limits";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { PERSON_TYPE_COMPANY_VALUE } from "../../constants/values";
import { usePerson, usePersonOptions } from "../../hooks/use-data";
import { usePersonForm } from "../../hooks/use-form";
import {
	getPersonDocumentLabel,
	getPersonDocumentPlaceholder,
	getPersonNameLabel,
} from "../../utils/format";

interface PersonFormProps {
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const PersonForm = ({ id, state, onSuccess }: PersonFormProps) => {
	const title = id ? "Editar pessoa" : "Nova pessoa";

	return (
		<Suspense fallback={<PersonFormSkeleton state={state} title={title} />}>
			{id ? (
				<EditPersonFormContent id={id} state={state} onSuccess={onSuccess} />
			) : (
				<CreatePersonFormContent state={state} onSuccess={onSuccess} />
			)}
		</Suspense>
	);
};

function CreatePersonFormContent({
	state,
	onSuccess,
}: Omit<PersonFormProps, "id">) {
	const { types, employeeTypes } = usePersonOptions();
	const { form } = usePersonForm({ onSuccess });

	return (
		<PersonFormContent
			form={form}
			state={state}
			title="Nova pessoa"
			types={types}
			employeeTypes={employeeTypes}
		/>
	);
}

function EditPersonFormContent({
	id,
	state,
	onSuccess,
}: Required<Pick<PersonFormProps, "id">> & Omit<PersonFormProps, "id">) {
	const { person } = usePerson(id);
	const { types, employeeTypes } = usePersonOptions();
	const { form } = usePersonForm({
		id,
		initialValue: person,
		onSuccess,
	});

	return (
		<PersonFormContent
			form={form}
			state={state}
			title="Editar pessoa"
			types={types}
			employeeTypes={employeeTypes}
		/>
	);
}

interface PersonFormContentProps {
	form: ReturnType<typeof usePersonForm>["form"];
	state: OverlayState;
	title: string;
	types: ReturnType<typeof usePersonOptions>["types"];
	employeeTypes: ReturnType<typeof usePersonOptions>["employeeTypes"];
}

function PersonFormContent({
	form,
	state,
	title,
	types,
	employeeTypes,
}: PersonFormContentProps) {
	const session = useLoggedUserSession();
	const canCustomer = hasPermission(session, "org:clients:read");
	const canSupplier = hasPermission(session, "org:suppliers:read");
	const canEmployee = hasPermission(session, "org:employees:read");
	return (
		<form.Form form={form}>
			<EntityForm state={state} title={title} footer={<form.Submit />}>
				<FormSection variant="plain" title="Papéis">
					<FieldGroup className="grid gap-4 sm:grid-cols-3">
						{canCustomer && (
							<form.AppField name="isCustomer">
								{(field) => <field.Checkbox label="Cliente" />}
							</form.AppField>
						)}
						{canSupplier && (
							<form.Subscribe selector={(state) => state.values.isEmployee}>
								{(employee) => (
									<form.AppField name="isSupplier">
										{(field) => (
											<field.Checkbox
												label="Fornecedor"
												isDisabled={!!employee}
											/>
										)}
									</form.AppField>
								)}
							</form.Subscribe>
						)}
						{canEmployee && (
							<form.AppField
								name="isEmployee"
								listeners={{
									onChange: ({ value }) => {
										if (value) {
											form.setFieldValue("isSupplier", true);
										}
									},
								}}
							>
								{(field) => <field.Checkbox label="Colaborador" />}
							</form.AppField>
						)}
					</FieldGroup>
					<form.Subscribe selector={(state) => state.values.isEmployee}>
						{(employee) =>
							employee ? (
								<p className="text-xs text-muted-foreground">
									Colaborador também é fornecedor de serviços.
								</p>
							) : null
						}
					</form.Subscribe>
				</FormSection>
				<form.Subscribe selector={(state) => state.values.isGeneric}>
					{(generic) =>
						generic ? (
							<p className="text-sm text-muted-foreground">
								Cadastro genérico do sistema, sem CPF/CNPJ.
							</p>
						) : null
					}
				</form.Subscribe>
				<form.Subscribe
					selector={(formState) => ({
						type: formState.values.type,
						generic: formState.values.isGeneric,
					})}
				>
					{({ type: typeValue, generic }) => {
						const nameLabel = getPersonNameLabel(typeValue);
						const documentLabel = getPersonDocumentLabel(typeValue);
						const documentPlaceholder = getPersonDocumentPlaceholder(typeValue);

						return (
							<FormSection variant="plain" title="Dados da pessoa">
								{!generic && (
									<FieldGroup className="grid gap-4 sm:grid-cols-2">
										<form.AppField name="type">
											{(field) => (
												<field.Autocomplete
													label="Tipo"
													options={types}
													isRequired
												/>
											)}
										</form.AppField>
										<form.AppField name="document">
											{(field) => (
												<field.InputMask
													label={documentLabel}
													maskKind={
														typeValue === PERSON_TYPE_COMPANY_VALUE
															? "cnpj"
															: "cpf"
													}
													placeholder={documentPlaceholder}
													isRequired
												/>
											)}
										</form.AppField>
									</FieldGroup>
								)}
								<FieldGroup>
									<form.AppField name="fullName">
										{(field) => (
											<field.Input
												label={nameLabel}
												maxLength={TEXT_LIMITS.name}
												isRequired
											/>
										)}
									</form.AppField>
								</FieldGroup>
								<FieldGroup className="grid gap-4 sm:grid-cols-2">
									<form.AppField name="email">
										{(field) => (
											<field.Input
												label="E-mail"
												type="email"
												maxLength={TEXT_LIMITS.email}
											/>
										)}
									</form.AppField>
									<form.AppField name="phone">
										{(field) => (
											<field.InputMask
												label="Telefone"
												maskKind="phoneBr"
												placeholder="(00) 00000-0000"
												type="tel"
												inputMode="numeric"
											/>
										)}
									</form.AppField>
								</FieldGroup>
								<FieldGroup>
									<form.AppField name="isActive">
										{(field) => <field.Checkbox label="Ativo" />}
									</form.AppField>
								</FieldGroup>
							</FormSection>
						);
					}}
				</form.Subscribe>
				{canEmployee && (
					<form.Subscribe selector={(state) => state.values.isEmployee}>
						{(employee) =>
							employee ? (
								<>
									<FormSection variant="plain" title="Dados profissionais">
										<FieldGroup className="grid gap-4 sm:grid-cols-2">
											<form.AppField
												name="employeeType"
												listeners={{
													onChange: ({ value }) => {
														if (value !== "LAWYER") {
															form.setFieldValue("oabNumber", "");
														}
													},
												}}
											>
												{(field) => (
													<field.Autocomplete
														label="Função"
														options={employeeTypes}
														isRequired
													/>
												)}
											</form.AppField>
											<form.Subscribe
												selector={(state) => state.values.employeeType}
											>
												{(type) =>
													type === "LAWYER" ? (
														<form.AppField name="oabNumber">
															{(field) => (
																<field.Input
																	label="OAB"
																	placeholder="RS000000"
																	maxLength={TEXT_LIMITS.oabNumber}
																	isRequired
																/>
															)}
														</form.AppField>
													) : null
												}
											</form.Subscribe>
										</FieldGroup>
									</FormSection>
									<FormSection variant="plain" title="Financeiro">
										<FieldGroup className="grid gap-4 sm:grid-cols-2">
											<form.AppField name="remunerationPercent">
												{(field) => (
													<field.Number
														label="Remuneração (%)"
														minValue={0}
														maxValue={1}
														step={0.05}
														isRequired
														formatOptions={{ style: "percent" }}
													/>
												)}
											</form.AppField>
											<form.AppField name="referrerPercent">
												{(field) => (
													<field.Number
														label="Indicação (%)"
														minValue={0}
														maxValue={1}
														step={0.05}
														isRequired
														formatOptions={{ style: "percent" }}
													/>
												)}
											</form.AppField>
										</FieldGroup>
									</FormSection>
								</>
							) : null
						}
					</form.Subscribe>
				)}
			</EntityForm>
		</form.Form>
	);
}

function PersonFormSkeleton({
	state,
	title,
}: Pick<PersonFormProps, "state"> & { title: string }) {
	return (
		<EntityForm
			state={state}
			title={title}
			isLoading
			footer={<Skeleton className="h-8 w-16 rounded-lg" />}
		>
			<FormSection variant="plain" title="Dados da pessoa">
				<FieldGroup className="grid gap-4 sm:grid-cols-2">
					<FormFieldSkeleton labelWidth="w-10" />
					<FormFieldSkeleton labelWidth="w-16" />
				</FieldGroup>
				<FieldGroup>
					<FormFieldSkeleton labelWidth="w-14" />
				</FieldGroup>
				<FieldGroup className="grid gap-4 sm:grid-cols-2">
					<FormFieldSkeleton labelWidth="w-12" />
					<FormFieldSkeleton labelWidth="w-16" />
				</FieldGroup>
				<FieldGroup>
					<FormCheckboxSkeleton labelWidth="w-10" />
				</FieldGroup>
			</FormSection>
		</EntityForm>
	);
}
