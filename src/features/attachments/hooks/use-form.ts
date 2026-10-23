import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { createAttachmentMutationOptions } from "../api/mutations";
import { attachmentKeys } from "../api/queries";
import {
	type AttachmentOwnerInput,
	attachmentFormInputSchema,
	attachmentUploadInputSchema,
} from "../schemas/form";
import { defaultAttachmentCreateValues } from "../utils/default";
import { inferAttachmentTypeFromFile } from "../utils/file";
import {
	buildAttachmentUploadInput,
	fileToBase64,
	type PreparedAttachmentFile,
} from "../utils/upload";

interface UseAttachmentFormOptions {
	onSuccess?: () => void;
	owner: AttachmentOwnerInput;
}

export function useAttachmentForm({
	onSuccess,
	owner,
}: UseAttachmentFormOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(createAttachmentMutationOptions());
	const [preparedFile, setPreparedFile] =
		useState<PreparedAttachmentFile | null>(null);
	const [isPreparingFile, setIsPreparingFile] = useState(false);
	const form = useAppForm({
		defaultValues: defaultAttachmentCreateValues(owner),
		validators: {
			onSubmit: attachmentFormInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsedForm = attachmentFormInputSchema.parse(value);
				const parsed = attachmentUploadInputSchema.parse(
					await buildAttachmentUploadInput(parsedForm, preparedFile),
				);
				await mutation.mutateAsync({ data: parsed });
				toast.success("Anexo enviado com sucesso.");
				await refreshAuditedEntityQueries(queryClient, attachmentKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return {
		form,
		isPending: mutation.isPending,
		isPreparingFile,
		handleFileChange: async (file: File | null) => {
			if (!file) {
				setPreparedFile(null);
				return;
			}

			setIsPreparingFile(true);

			try {
				const type =
					inferAttachmentTypeFromFile({
						fileName: file.name,
						mimeType: file.type,
					}) ?? "";
				const fileBase64 = await fileToBase64(file);

				setPreparedFile({
					file,
					fileBase64,
					type,
				});
			} finally {
				setIsPreparingFile(false);
			}
		},
	};
}
