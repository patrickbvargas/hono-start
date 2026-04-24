import { FormWrapper } from "@/shared/components/form-wrapper";
import { FieldGroup } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useClientOptions } from "../../hooks/use-data";
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
	const { types } = useClientOptions();
	const { form } = useClientForm({ id, onSuccess });

	const title = id ? "Editar cliente" : "Novo cliente";

	return (
		<form.Form form={form}>
			<FormWrapper state={state} title={title} footer={<form.Submit />}>
				<form.Subscribe selector={(formState) => formState.values.type}>
					{(typeValue) => {
						const nameLabel = getClientNameLabel(typeValue);
						const documentLabel = getClientDocumentLabel(typeValue);
						const documentPlaceholder = getClientDocumentPlaceholder(typeValue);

						return (
							<>
								<FieldGroup className="grid gap-5 sm:grid-cols-2">
									<form.AppField name="type">
										{(field) => (
											<field.Autocomplete
												label="Tipo"
												options={types}
												isRequired
												isDisabled={!!id}
												description={
													id
														? "O tipo do cliente não pode ser alterado."
														: undefined
												}
											/>
										)}
									</form.AppField>
									<form.AppField name="document">
										{(field) => (
											<field.Input
												label={documentLabel}
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
										{(field) => <field.Input label="Telefone" />}
									</form.AppField>
								</FieldGroup>
								<FieldGroup>
									<form.AppField name="isActive">
										{(field) => <field.Checkbox label="Ativo" />}
									</form.AppField>
								</FieldGroup>
							</>
						);
					}}
				</form.Subscribe>
			</FormWrapper>
		</form.Form>
	);
};
