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
				<FieldGroup>
					<p role="status" className="text-sm text-muted-foreground">
						{isLoadingAttachments
							? "Carregando limite de anexos..."
							: attachmentsError
								? "Não foi possível verificar o limite. Feche e tente novamente."
								: remainingSlots === 0
									? "Limite de 25 anexos atingido. Exclua um anexo para liberar espaço."
									: `${remainingSlots} de 25 vagas disponíveis. Até ${maxFiles} arquivos neste envio.`}
					</p>
					<form.AppField name="files">
						{(field) => (
							<field.File
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
								emptyTitle="Arraste e solte arquivos aqui"
								dropDescription="Selecione até 25 arquivos por envio. PDF, JPG e PNG, até 10 MB por arquivo."
								loadingText="Enviando arquivos..."
								browseLabel="Selecionar arquivos"
							/>
						)}
					</form.AppField>
				</FieldGroup>
			</EntityForm>
		</form.Form>
	);
};
