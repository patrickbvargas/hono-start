import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { restoreFeeMutationOptions } from "../api/mutations";
import { FEE_DATA_CACHE_KEY } from "../constants/cache";

interface UseFeeRestoreOptions {
	onSuccess?: () => void;
}

export function useFeeRestore({ onSuccess }: UseFeeRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreFeeMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Honorário restaurado com sucesso.");
			await refreshEntityQueries(queryClient, FEE_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
