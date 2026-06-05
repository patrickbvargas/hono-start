import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { restoreEmployeeAccessMutationOptions } from "../api/mutations";
import { employeeKeys } from "../api/queries";

interface UseEmployeeRestoreAccessOptions {
	onSuccess?: () => void;
}

export function useEmployeeRestoreAccess({
	onSuccess,
}: UseEmployeeRestoreAccessOptions = {}) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreEmployeeAccessMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Acesso restaurado com sucesso.");
			await refreshAuditedEntityQueries(queryClient, employeeKeys.all);
			onSuccess?.();
			return true;
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
			return false;
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
