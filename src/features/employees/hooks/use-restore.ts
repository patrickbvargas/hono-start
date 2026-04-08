import { useMutation, useQueryClient } from "@tanstack/react-query";
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
			queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DATA_CACHE_KEY] });
			onSuccess?.();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Ocorreu um erro inesperado";
			toast.danger(message);
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
