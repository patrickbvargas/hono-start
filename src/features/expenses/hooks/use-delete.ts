import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deleteExpenseMutationOptions } from "../api/mutations";
import { expenseKeys } from "../api/queries";

interface UseExpenseDeleteOptions {
	onSuccess?: () => void;
}

export function useExpenseDelete({ onSuccess }: UseExpenseDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteExpenseMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Despesa excluída com sucesso.");
			await refreshAuditedEntityQueries(queryClient, expenseKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
