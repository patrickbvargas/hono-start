import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { createAttachmentMutationOptions } from "../api/mutations";
import { attachmentKeys } from "../api/queries";
import {
	ATTACHMENT_MAX_BATCH_FILES,
	ATTACHMENT_MAX_OWNER_FILES,
} from "../constants/values";
import {
	type AttachmentOwnerInput,
	attachmentBatchFormInputSchema,
} from "../schemas/form";
import { defaultAttachmentCreateValues } from "../utils/default";
import { uploadAttachmentBatch } from "../utils/upload-batch";
import { useAttachments } from "./use-data";

interface UseAttachmentFormOptions {
	onSuccess?: () => void;
	owner: AttachmentOwnerInput;
}

export function useAttachmentForm({
	onSuccess,
	owner,
}: UseAttachmentFormOptions) {
	const queryClient = useQueryClient();
	const {
		attachments,
		isPending: isLoadingAttachments,
		error: attachmentsError,
	} = useAttachments(owner);
	const remainingSlots = Math.max(
		0,
		ATTACHMENT_MAX_OWNER_FILES - attachments.length,
	);
	const maxFiles = Math.min(ATTACHMENT_MAX_BATCH_FILES, remainingSlots);
	const mutation = useMutation(createAttachmentMutationOptions());
	const [progress, setProgress] = useState<string | null>(null);
	const form = useAppForm({
		defaultValues: defaultAttachmentCreateValues(owner),
		validators: {
			onChange: attachmentBatchFormInputSchema,
			onSubmit: attachmentBatchFormInputSchema,
		},
		onSubmit: async ({ value }) => {
			let saved = false;
			try {
				const parsed = attachmentBatchFormInputSchema.parse(value);
				if (isLoadingAttachments || attachmentsError) {
					toast.danger("Aguarde o carregamento dos anexos e tente novamente.");
					return;
				}
				if (parsed.files.length > remainingSlots) {
					toast.danger(
						`Restam ${remainingSlots} vagas para anexos neste registro.`,
					);
					return;
				}

				await uploadAttachmentBatch({
					input: parsed,
					upload: async (data) => {
						setProgress("Enviando anexos...");
						await mutation.mutateAsync({ data });
					},
					onProgress: (index, total) =>
						setProgress(`Preparando ${index} de ${total}...`),
				});
				saved = true;
				toast.success(
					parsed.files.length === 1
						? "Anexo enviado com sucesso."
						: `${parsed.files.length} anexos enviados com sucesso.`,
				);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			} finally {
				setProgress(null);
				if (saved) {
					await refreshAuditedEntityQueries(queryClient, attachmentKeys.all);
				}
			}
		},
	});
	return {
		form,
		progress,
		maxFiles,
		remainingSlots,
		isLoadingAttachments,
		attachmentsError,
		isPending: progress !== null,
	};
}
