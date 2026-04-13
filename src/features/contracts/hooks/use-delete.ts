import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { deleteContractOptions } from "../api/delete";
import { CONTRACT_DATA_CACHE_KEY } from "../constants";
import type { Contract } from "../schemas/model";

interface UseContractDeleteOptions {
	contract: Contract;
	onSuccess?: () => void;
}

export function useContractDelete({
	contract,
	onSuccess,
}: UseContractDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteContractOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id: contract.id } });
			toast.success("Contrato excluído com sucesso.");
			await refreshEntityQueries(queryClient, CONTRACT_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
