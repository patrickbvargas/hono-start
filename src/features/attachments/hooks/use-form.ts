import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { createAttachmentMutationOptions } from "../api/mutations";
import { ATTACHMENT_DATA_CACHE_KEY } from "../constants/cache";
import {
	type AttachmentOwnerInput,
	attachmentUploadInputSchema,
} from "../schemas/form";
import { defaultAttachmentCreateValues } from "../utils/default";

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
	const form = useAppForm({
		defaultValues: defaultAttachmentCreateValues(owner),
		validators: {
			onSubmit: attachmentUploadInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsed = attachmentUploadInputSchema.parse(value);
				await mutation.mutateAsync({ data: parsed });
				toast.success("Anexo enviado com sucesso.");
				await refreshEntityQueries(queryClient, ATTACHMENT_DATA_CACHE_KEY);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return { form, isPending: mutation.isPending };
}
