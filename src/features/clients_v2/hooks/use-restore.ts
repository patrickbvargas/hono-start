import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { restoreClientMutationOptions } from "../api/mutations";
import { CLIENT_DATA_CACHE_KEY } from "../constants/cache";

interface UseClientRestoreOptions {
	id: EntityId;
	onSuccess?: () => void;
}

export function useClientRestore({ id, onSuccess }: UseClientRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreClientMutationOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Cliente restaurado com sucesso.");
			await refreshEntityQueries(queryClient, CLIENT_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
