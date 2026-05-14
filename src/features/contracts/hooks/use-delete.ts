import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deleteContractMutationOptions } from "../api/mutations";
import { contractKeys } from "../api/queries";

interface UseContractDeleteOptions {
	onSuccess?: () => void;
}

export function useContractDelete({ onSuccess }: UseContractDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteContractMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Contrato excluído com sucesso.");
			await refreshAuditedEntityQueries(queryClient, contractKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
