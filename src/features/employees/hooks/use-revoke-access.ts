import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { revokeEmployeeAccessMutationOptions } from "../api/mutations";
import { employeeKeys } from "../api/queries";

interface UseEmployeeRevokeAccessOptions {
	onSuccess?: () => void;
}

export function useEmployeeRevokeAccess({
	onSuccess,
}: UseEmployeeRevokeAccessOptions = {}) {
	const queryClient = useQueryClient();
	const mutation = useMutation(revokeEmployeeAccessMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Acesso revogado com sucesso.");
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
