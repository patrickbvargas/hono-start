import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
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

	const handleConfirm = async (id: EntityId) => {
		try {
			const result = await mutation.mutateAsync({ data: { id } });
			toast.success("Acesso concedido com sucesso.");
			await refreshEntityQueries(queryClient, employeeKeys.all);
			onSuccess?.();
			return result.temporaryPassword;
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
			return null;
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
