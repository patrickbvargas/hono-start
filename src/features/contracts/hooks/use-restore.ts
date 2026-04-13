import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { restoreContractOptions } from "../api/restore";
import { CONTRACT_DATA_CACHE_KEY } from "../constants";
import type { Contract } from "../schemas/model";

interface UseContractRestoreOptions {
	contract: Contract;
	onSuccess?: () => void;
}

export function useContractRestore({
	contract,
	onSuccess,
}: UseContractRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreContractOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id: contract.id } });
			toast.success("Contrato restaurado com sucesso.");
			await refreshEntityQueries(queryClient, CONTRACT_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
