import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { restoreEmployeeOptions } from "../api/restore";
import { EMPLOYEE_DATA_CACHE_KEY } from "../constants";
import type { Employee } from "../schemas/model";

interface UseEmployeeRestoreOptions {
	employee: Employee;
	onSuccess?: () => void;
}

export function useEmployeeRestore({
	employee,
	onSuccess,
}: UseEmployeeRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreEmployeeOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id: employee.id } });
			toast.success("Funcionário restaurado com sucesso.");
			await refreshEntityQueries(queryClient, EMPLOYEE_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
