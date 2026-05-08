import { EntityForm } from "@/shared/components/entity-form";
import { FieldGroup } from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";
import { ATTACHMENT_ACCEPT_ATTRIBUTE } from "../../constants/values";
import { useAttachmentForm } from "../../hooks/use-form";
import type { AttachmentOwnerInput } from "../../schemas/form";

interface AttachmentFormProps {
	onSuccess?: () => void;
	owner: AttachmentOwnerInput;
	state: OverlayState;
}

export const AttachmentForm = ({
	onSuccess,
	owner,
	state,
}: AttachmentFormProps) => {
	const { form, handleFileChange, isPending, isPreparingFile } =
		useAttachmentForm({ owner, onSuccess });

	return (
		<form.Form form={form}>
			<EntityForm
				state={state}
				title="Novo anexo"
				footer={<form.Submit disabled={isPending || isPreparingFile} />}
			>
				<FieldGroup>
					<form.AppField name="file">
						{(field) => (
							<field.File
								isRequired
								accept={ATTACHMENT_ACCEPT_ATTRIBUTE}
								isDisabled={isPending}
								isLoading={isPreparingFile}
								onValueChange={handleFileChange}
								emptyTitle="Arraste e solte arquivo aqui"
								dropDescription="Ou clique para procurar. Formatos aceitos: PDF, JPG e PNG, até 10 MB."
								loadingText="Preparando arquivo para envio..."
								browseLabel="Selecionar arquivo"
							/>
						)}
					</form.AppField>
				</FieldGroup>
			</EntityForm>
		</form.Form>
	);
};
