import { Suspense } from "react";
import { EntityForm } from "@/shared/components/entity-form";
import {
	FormCheckboxSkeleton,
	FormFieldSkeleton,
	FormTextAreaSkeleton,
} from "@/shared/components/form-field-skeleton";
import { FormSection } from "@/shared/components/form-section";
import { FieldGroup, Skeleton } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useExpense, useExpenseOptions } from "../../hooks/use-data";
import { useExpenseForm } from "../../hooks/use-form";

interface ExpenseFormProps {
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ExpenseForm = ({ id, state, onSuccess }: ExpenseFormProps) => {
	const title = id ? "Editar despesa" : "Nova despesa";

	return (
		<Suspense fallback={<ExpenseFormSkeleton state={state} title={title} />}>
			{id ? (
				<EditExpenseFormContent id={id} state={state} onSuccess={onSuccess} />
			) : (
				<CreateExpenseFormContent state={state} onSuccess={onSuccess} />
			)}
		</Suspense>
	);
};

function CreateExpenseFormContent({
	state,
	onSuccess,
}: Omit<ExpenseFormProps, "id">) {
	const { form } = useExpenseForm({ onSuccess });

	return (
		<form.Form form={form} showDebug>
			<ExpenseFormFields form={form} state={state} title="Nova despesa" />
		</form.Form>
	);
}

function EditExpenseFormContent({
	id,
	state,
	onSuccess,
}: Required<Pick<ExpenseFormProps, "id">> & Omit<ExpenseFormProps, "id">) {
	const { expense } = useExpense(id);
	const { form } = useExpenseForm({
		id,
		initialValue: expense,
		onSuccess,
	});

	return (
		<form.Form form={form} showDebug>
			<ExpenseFormFields form={form} state={state} title="Editar despesa" />
		</form.Form>
	);
}

interface ExpenseFormFieldsProps {
	form: ReturnType<typeof useExpenseForm>["form"];
	state: OverlayState;
	title: string;
}

function ExpenseFormFields({ form, state, title }: ExpenseFormFieldsProps) {
	const { categories } = useExpenseOptions();

	return (
		<EntityForm state={state} title={title} footer={<form.Submit />}>
			<FormSection>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<form.AppField name="category">
						{(field) => (
							<field.Autocomplete
								label="Categoria"
								options={categories}
								isRequired
								classNames={{ wrapper: "sm:col-span-2" }}
							/>
						)}
					</form.AppField>
					<form.AppField name="expenseDate">
						{(field) => <field.DatePicker label="Data" isRequired />}
					</form.AppField>
					<form.AppField name="amount">
						{(field) => (
							<field.Number
								label="Valor"
								minValue={0}
								step={100}
								isRequired
								formatOptions={{ style: "currency", currency: "BRL" }}
							/>
						)}
					</form.AppField>
					<form.AppField name="notes">
						{(field) => (
							<field.Textarea
								label="Observação"
								classNames={{ wrapper: "sm:col-span-2" }}
							/>
						)}
					</form.AppField>
				</FieldGroup>
			</FormSection>
			<FormSection>
				<form.AppField name="isActive">
					{(field) => <field.Checkbox label="Ativo" />}
				</form.AppField>
			</FormSection>
		</EntityForm>
	);
}

function ExpenseFormSkeleton({
	state,
	title,
}: Pick<ExpenseFormProps, "state"> & { title: string }) {
	return (
		<EntityForm
			state={state}
			title={title}
			footer={<Skeleton className="h-9 w-28 rounded-md" />}
		>
			<FormSection>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<FormFieldSkeleton labelWidth="w-18" className="sm:col-span-2" />
					<FormFieldSkeleton labelWidth="w-12" />
					<FormFieldSkeleton labelWidth="w-10" />
					<FormTextAreaSkeleton labelWidth="w-22" className="sm:col-span-2" />
				</FieldGroup>
			</FormSection>
			<FormSection>
				<FormCheckboxSkeleton labelWidth="w-10" />
			</FormSection>
		</EntityForm>
	);
}
