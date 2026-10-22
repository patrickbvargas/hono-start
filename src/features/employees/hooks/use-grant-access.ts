import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { grantEmployeeAccessMutationOptions } from "../api/mutations";
import { employeeKeys } from "../api/queries";

interface UseEmployeeGrantAccessOptions {
	onSuccess?: () => void;
}

export function useEmployeeGrantAccess({
	onSuccess,
}: UseEmployeeGrantAccessOptions = {}) {
	const queryClient = useQueryClient();
	const mutation = useMutation(grantEmployeeAccessMutationOptions());

	const handleConfirm = async (id: EntityId, role: string) => {
		try {
			await mutation.mutateAsync({ data: { id, role } });
			toast.success(
				"Solicitação de acesso concluída. Consulte o status do convite.",
			);
			await refreshAuditedEntityQueries(queryClient, employeeKeys.all);
			onSuccess?.();
			return true;
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
			return null;
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
