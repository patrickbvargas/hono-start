import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { deleteFeeOptions } from "../api/delete";
import { FEE_DATA_CACHE_KEY } from "../constants";
import type { Fee } from "../schemas/model";

interface UseFeeDeleteOptions {
	fee: Fee;
	onSuccess?: () => void;
}

export function useFeeDelete({ fee, onSuccess }: UseFeeDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteFeeOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id: fee.id } });
			toast.success("Honorário excluído com sucesso.");
			await refreshEntityQueries(queryClient, FEE_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
