import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { resetEmployeePasswordMutationOptions } from "../api/mutations";
import { employeeKeys } from "../api/queries";

interface UseEmployeeResetPasswordOptions {
	onSuccess?: () => void;
}

export function useEmployeeResetPassword({
	onSuccess,
}: UseEmployeeResetPasswordOptions = {}) {
	const queryClient = useQueryClient();
	const mutation = useMutation(resetEmployeePasswordMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			const result = await mutation.mutateAsync({ data: { id } });
			toast.success("Senha temporária gerada com sucesso.");
			await refreshAuditedEntityQueries(queryClient, employeeKeys.all);
			onSuccess?.();
			return result.temporaryPassword;
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
			return null;
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
