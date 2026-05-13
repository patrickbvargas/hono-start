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
import { CLIENT_TYPE_COMPANY_VALUE } from "../../constants/values";
import { useClient, useClientOptions } from "../../hooks/use-data";
import { useClientForm } from "../../hooks/use-form";
import {
	getClientDocumentLabel,
	getClientDocumentPlaceholder,
	getClientNameLabel,
} from "../../utils/format";

interface ClientFormProps {
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ClientForm = ({ id, state, onSuccess }: ClientFormProps) => {
	const title = id ? "Editar cliente" : "Novo cliente";

	return (
		<Suspense fallback={<ClientFormSkeleton state={state} title={title} />}>
			{id ? (
				<EditClientFormContent id={id} state={state} onSuccess={onSuccess} />
			) : (
				<CreateClientFormContent state={state} onSuccess={onSuccess} />
			)}
		</Suspense>
	);
};

function CreateClientFormContent({
	state,
	onSuccess,
}: Omit<ClientFormProps, "id">) {
	const { types } = useClientOptions();
	const { form } = useClientForm({ onSuccess });

	return (
		<ClientFormContent
			form={form}
			state={state}
			title="Novo cliente"
			types={types}
		/>
	);
}

function EditClientFormContent({
	id,
	state,
	onSuccess,
}: Required<Pick<ClientFormProps, "id">> & Omit<ClientFormProps, "id">) {
	const { client } = useClient(id);
	const { types } = useClientOptions();
	const { form } = useClientForm({
		id,
		initialValue: client,
		onSuccess,
	});

	return (
		<ClientFormContent
			form={form}
			state={state}
			title="Editar cliente"
			types={types}
		/>
	);
}

interface ClientFormContentProps {
	form: ReturnType<typeof useClientForm>["form"];
	state: OverlayState;
	title: string;
	types: ReturnType<typeof useClientOptions>["types"];
}

function ClientFormContent({
	form,
	state,
	title,
	types,
}: ClientFormContentProps) {
	return (
		<form.Form form={form}>
			<EntityForm state={state} title={title} footer={<form.Submit />}>
				<form.Subscribe selector={(formState) => formState.values.type}>
					{(typeValue) => {
						const nameLabel = getClientNameLabel(typeValue);
						const documentLabel = getClientDocumentLabel(typeValue);
						const documentPlaceholder = getClientDocumentPlaceholder(typeValue);

						return (
							<FormSection>
								<FieldGroup className="grid gap-5 sm:grid-cols-2">
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
													typeValue === CLIENT_TYPE_COMPANY_VALUE
														? "cnpj"
														: "cpf"
												}
												placeholder={documentPlaceholder}
												isRequired
											/>
										)}
									</form.AppField>
								</FieldGroup>
								<FieldGroup>
									<form.AppField name="fullName">
										{(field) => <field.Input label={nameLabel} isRequired />}
									</form.AppField>
								</FieldGroup>
								<FieldGroup className="grid gap-5 sm:grid-cols-2">
									<form.AppField name="email">
										{(field) => <field.Input label="Email" type="email" />}
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
			</EntityForm>
		</form.Form>
	);
}

function ClientFormSkeleton({
	state,
	title,
}: Pick<ClientFormProps, "state"> & { title: string }) {
	return (
		<EntityForm
			state={state}
			title={title}
			footer={<Skeleton className="h-9 w-28 rounded-md" />}
		>
			<FormSection>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<FormFieldSkeleton labelWidth="w-10" />
					<FormFieldSkeleton labelWidth="w-16" />
				</FieldGroup>
				<FieldGroup>
					<FormFieldSkeleton labelWidth="w-14" />
				</FieldGroup>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
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
