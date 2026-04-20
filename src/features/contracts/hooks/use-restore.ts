import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { restoreContractMutationOptions } from "../api/mutations";
import { CONTRACT_DATA_CACHE_KEY } from "../constants/cache";

interface UseContractRestoreOptions {
	onSuccess?: () => void;
}

export function useContractRestore({ onSuccess }: UseContractRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreContractMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Contrato restaurado com sucesso.");
			await refreshEntityQueries(queryClient, CONTRACT_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
