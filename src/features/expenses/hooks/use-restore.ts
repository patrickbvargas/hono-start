import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { restoreExpenseMutationOptions } from "../api/mutations";
import { expenseKeys } from "../api/queries";

interface UseExpenseRestoreOptions {
	onSuccess?: () => void;
}

export function useExpenseRestore({ onSuccess }: UseExpenseRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreExpenseMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Despesa restaurada com sucesso.");
			await refreshAuditedEntityQueries(queryClient, expenseKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
