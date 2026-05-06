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
import { LAWYER_TYPE_VALUE } from "../../constants/values";
import { useEmployeeOptions } from "../../hooks/use-data";
import { useEmployeeForm } from "../../hooks/use-form";

interface EmployeeFormProps {
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const EmployeeForm = ({ id, state, onSuccess }: EmployeeFormProps) => {
	const title = id ? "Editar funcionário" : "Novo funcionário";

	return (
		<Suspense fallback={<EmployeeFormSkeleton state={state} title={title} />}>
			<EmployeeFormContent id={id} state={state} onSuccess={onSuccess} />
		</Suspense>
	);
};

function EmployeeFormContent({ id, state, onSuccess }: EmployeeFormProps) {
	const { roles, types } = useEmployeeOptions();
	const { form } = useEmployeeForm({ id, onSuccess });

	const title = id ? "Editar funcionário" : "Novo funcionário";

	return (
		<form.Form form={form}>
			<EntityForm state={state} title={title} footer={<form.Submit />}>
				<FormSection>
					<FieldGroup>
						<form.AppField name="fullName">
							{(field) => <field.Input label="Nome" isRequired />}
						</form.AppField>
						<form.AppField name="email">
							{(field) => <field.Input label="Email" isRequired />}
						</form.AppField>
					</FieldGroup>
					<FieldGroup className="grid gap-5 sm:grid-cols-2">
						<form.AppField
							name="type"
							listeners={{
								onChange: ({ value }) => {
									if (value !== LAWYER_TYPE_VALUE) {
										form.setFieldValue("oabNumber", "");
									}
								},
							}}
						>
							{(field) => (
								<field.Autocomplete label="Função" options={types} isRequired />
							)}
						</form.AppField>
						<form.AppField name="role">
							{(field) => (
								<field.Autocomplete label="Perfil" options={roles} isRequired />
							)}
						</form.AppField>
						<form.Subscribe
							selector={(state) => state.values.type === LAWYER_TYPE_VALUE}
						>
							{(isLawyer) =>
								isLawyer && (
									<form.AppField name="oabNumber">
										{(field) => (
											<field.Input
												label="OAB"
												placeholder="RS000000"
												maxLength={8}
												isRequired
											/>
										)}
									</form.AppField>
								)
							}
						</form.Subscribe>
					</FieldGroup>
				</FormSection>
				<FormSection title="Financeiro">
					<FieldGroup className="grid gap-5 sm:grid-cols-2">
						<form.AppField name="remunerationPercent">
							{(field) => (
								<field.Number
									label="% Remuneração"
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
									label="% Indicação"
									minValue={0}
									maxValue={1}
									step={0.05}
									isRequired
									formatOptions={{ style: "percent" }}
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
			</EntityForm>
		</form.Form>
	);
}

function EmployeeFormSkeleton({
	state,
	title,
}: Pick<EmployeeFormProps, "state"> & { title: string }) {
	return (
		<EntityForm
			state={state}
			title={title}
			footer={<Skeleton className="h-9 w-28 rounded-md" />}
		>
			<FormSection>
				<FieldGroup>
					<FormFieldSkeleton labelWidth="w-12" />
					<FormFieldSkeleton labelWidth="w-12" />
				</FieldGroup>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<FormFieldSkeleton labelWidth="w-14" />
					<FormFieldSkeleton labelWidth="w-12" />
				</FieldGroup>
			</FormSection>
			<FormSection title="Financeiro">
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<FormFieldSkeleton labelWidth="w-26" />
					<FormFieldSkeleton labelWidth="w-18" />
				</FieldGroup>
				<FieldGroup>
					<FormCheckboxSkeleton labelWidth="w-10" />
				</FieldGroup>
			</FormSection>
		</EntityForm>
	);
}
