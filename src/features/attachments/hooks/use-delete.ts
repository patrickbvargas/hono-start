import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deleteAttachmentMutationOptions } from "../api/mutations";
import { attachmentKeys } from "../api/queries";

interface UseAttachmentDeleteOptions {
	onSuccess?: () => void;
}

export function useAttachmentDelete({ onSuccess }: UseAttachmentDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteAttachmentMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Anexo excluído com sucesso.");
			await refreshEntityQueries(queryClient, attachmentKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
