import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deleteEmployeeMutationOptions } from "../api/mutations";
import { employeeKeys } from "../api/queries";

interface UseEmployeeDeleteOptions {
	onSuccess?: () => void;
}

export function useEmployeeDelete({ onSuccess }: UseEmployeeDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteEmployeeMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Funcionário excluído com sucesso.");
			await refreshEntityQueries(queryClient, employeeKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
