import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deleteFeeMutationOptions } from "../api/mutations";
import { feeKeys } from "../api/queries";

interface UseFeeDeleteOptions {
	onSuccess?: () => void;
}

export function useFeeDelete({ onSuccess }: UseFeeDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteFeeMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Honorário excluído com sucesso.");
			await refreshEntityQueries(queryClient, feeKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
