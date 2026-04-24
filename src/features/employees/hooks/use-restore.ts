import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
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
			toast.success("Funcionário restaurado com sucesso.");
			await refreshEntityQueries(queryClient, employeeKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
