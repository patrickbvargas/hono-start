import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { restoreFeeOptions } from "../api/restore";
import { FEE_DATA_CACHE_KEY } from "../constants";
import type { Fee } from "../schemas/model";

interface UseFeeRestoreOptions {
	fee: Fee;
	onSuccess?: () => void;
}

export function useFeeRestore({ fee, onSuccess }: UseFeeRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreFeeOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id: fee.id } });
			toast.success("Honorário restaurado com sucesso.");
			await refreshEntityQueries(queryClient, FEE_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
