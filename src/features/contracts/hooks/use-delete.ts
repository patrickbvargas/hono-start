import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deleteContractMutationOptions } from "../api/mutations";
import { CONTRACT_DATA_CACHE_KEY } from "../constants";

interface UseContractDeleteOptions {
	id: EntityId;
	onSuccess?: () => void;
}

export function useContractDelete({ id, onSuccess }: UseContractDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteContractMutationOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Contrato excluído com sucesso.");
			await refreshEntityQueries(queryClient, CONTRACT_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
