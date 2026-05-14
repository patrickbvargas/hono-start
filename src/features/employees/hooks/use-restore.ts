import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { restoreEmployeeMutationOptions } from "../api/mutations";
import { employeeKeys } from "../api/queries";

interface UseEmployeeRestoreOptions {
	onSuccess?: () => void;
}

export function useEmployeeRestore({ onSuccess }: UseEmployeeRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreEmployeeMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Colaborador restaurado com sucesso.");
			await refreshAuditedEntityQueries(queryClient, employeeKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
