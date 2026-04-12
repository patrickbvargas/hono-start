import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { deleteEmployeeOptions } from "../api/delete";
import { EMPLOYEE_DATA_CACHE_KEY } from "../constants";
import type { Employee } from "../schemas/model";

interface UseEmployeeDeleteOptions {
	employee: Employee;
	onSuccess?: () => void;
}

export function useEmployeeDelete({
	employee,
	onSuccess,
}: UseEmployeeDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteEmployeeOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id: employee.id } });
			toast.success("Funcionário excluído com sucesso.");
			await refreshEntityQueries(queryClient, EMPLOYEE_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
