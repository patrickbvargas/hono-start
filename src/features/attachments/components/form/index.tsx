import { useId } from "react";
import { EntityForm } from "@/shared/components/entity-form";
import { FormSection } from "@/shared/components/form-section";
import {
	FieldGroup,
	FieldWrapper,
	Input,
	Spinner,
} from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";
import { ATTACHMENT_ACCEPT_ATTRIBUTE } from "../../constants/values";
import { useAttachmentOptions } from "../../hooks/use-data";
import { useAttachmentForm } from "../../hooks/use-form";
import type { AttachmentOwnerInput } from "../../schemas/form";

interface AttachmentFormProps {
	onSuccess?: () => void;
	owner: AttachmentOwnerInput;
	state: OverlayState;
}

async function fileToBase64(file: File) {
	const buffer = await file.arrayBuffer();
	let binary = "";
	const bytes = new Uint8Array(buffer);

	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary);
}

export const AttachmentForm = ({
	onSuccess,
	owner,
	state,
}: AttachmentFormProps) => {
	const fileInputId = useId();
	const {
		data: types,
		error,
		isPending: isLoadingOptions,
	} = useAttachmentOptions();
	const { form, isPending } = useAttachmentForm({ owner, onSuccess });

	return (
		<form.Form form={form}>
			<EntityForm state={state} title="Novo anexo" footer={<form.Submit />}>
				{isLoadingOptions ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Spinner />
						Carregando tipos de anexo...
					</div>
				) : null}
				{error ? (
					<p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
						{error instanceof Error
							? error.message
							: "Não foi possível carregar tipos de anexo."}
					</p>
				) : null}
				<FormSection title="Arquivo">
					<FieldGroup>
						<form.AppField name="type">
							{(field) => (
								<field.Autocomplete
									label="Tipo"
									options={types ?? []}
									isRequired
								/>
							)}
						</form.AppField>
						<form.AppField name="fileName">
							{(field) => (
								<FieldWrapper
									id={fileInputId}
									label="Arquivo"
									isRequired
									description="Formatos aceitos: PDF, JPG e PNG. Tamanho máximo: 10 MB."
									errors={field.state.meta.errors}
								>
									<Input
										id={fileInputId}
										type="file"
										accept={ATTACHMENT_ACCEPT_ATTRIBUTE}
										disabled={isPending}
										onBlur={field.handleBlur}
										onChange={async (event) => {
											const file = event.target.files?.[0];

											if (!file) {
												field.handleChange("");
												form.setFieldValue("mimeType", "");
												form.setFieldValue("fileSize", 0);
												form.setFieldValue("fileBase64", "");
												return;
											}

											field.handleChange(file.name);
											form.setFieldValue("mimeType", file.type);
											form.setFieldValue("fileSize", file.size);
											form.setFieldValue(
												"fileBase64",
												await fileToBase64(file),
											);
										}}
									/>
								</FieldWrapper>
							)}
						</form.AppField>
						<form.AppField name="isActive">
							{(field) => <field.Checkbox label="Ativo" />}
						</form.AppField>
					</FieldGroup>
				</FormSection>
			</EntityForm>
		</form.Form>
	);
};
