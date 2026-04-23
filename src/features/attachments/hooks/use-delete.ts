import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deleteAttachmentMutationOptions } from "../api/mutations";
import { ATTACHMENT_DATA_CACHE_KEY } from "../constants/cache";

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
			await refreshEntityQueries(queryClient, ATTACHMENT_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
