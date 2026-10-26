import { EntityForm } from "@/shared/components/entity-form";
import { FormSection } from "@/shared/components/form-section";
import type { OverlayState } from "@/shared/types/overlay";
import {
	ATTACHMENT_ACCEPT_ATTRIBUTE,
	ATTACHMENT_MAX_OWNER_FILES,
} from "../../constants/values";
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
	const {
		form,
		isPending,
		progress,
		maxFiles,
		remainingSlots,
		isLoadingAttachments,
		attachmentsError,
	} = useAttachmentForm({ owner, onSuccess });

	return (
		<form.Form form={form}>
			<EntityForm
				state={state}
				title="Novos anexos"
				footer={
					<form.Submit
						disabled={
							isPending ||
							isLoadingAttachments ||
							!!attachmentsError ||
							remainingSlots === 0
						}
					>
						{progress ?? "Enviar anexos"}
					</form.Submit>
				}
			>
				<FormSection>
					<p role="status" className="text-sm text-muted-foreground">
						{isLoadingAttachments
							? "Carregando limite de anexos..."
							: attachmentsError
								? "Não foi possível verificar o limite. Feche e tente novamente."
								: remainingSlots === 0
									? `Limite de ${ATTACHMENT_MAX_OWNER_FILES} anexos atingido. Exclua um anexo para liberar espaço.`
									: `Você pode adicionar mais ${maxFiles} ${maxFiles === 1 ? "anexo" : "anexos"}.`}
					</p>
					<form.AppField name="files">
						{(field) => (
							<field.File
								label="Arquivos"
								multiple
								maxFiles={maxFiles}
								isRequired
								accept={ATTACHMENT_ACCEPT_ATTRIBUTE}
								isDisabled={
									isPending ||
									isLoadingAttachments ||
									!!attachmentsError ||
									remainingSlots === 0
								}
								isLoading={isPending}
								emptyTitle="Arraste arquivos aqui ou clique em Selecionar arquivos"
								dropDescription="PDF, JPG ou PNG • Até 10 MB por arquivo."
								loadingText="Enviando arquivos..."
								browseLabel="Selecionar arquivos"
							/>
						)}
					</form.AppField>
				</FormSection>
			</EntityForm>
		</form.Form>
	);
};
