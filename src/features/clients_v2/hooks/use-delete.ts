import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deleteClientMutationOptions } from "../api/mutations";
import { CLIENT_DATA_CACHE_KEY } from "../constants/cache";

interface UseClientDeleteOptions {
	id: EntityId;
	onSuccess?: () => void;
}

export function useClientDelete({ id, onSuccess }: UseClientDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteClientMutationOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Cliente excluído com sucesso.");
			await refreshEntityQueries(queryClient, CLIENT_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
