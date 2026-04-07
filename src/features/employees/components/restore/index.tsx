import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { toast } from "@/shared/lib/toast";
import type { OverlayState } from "@/shared/types/overlay";
import { restoreEmployeeOptions } from "../../api/restore";
import { EMPLOYEE_DATA_CACHE_KEY } from "../../constants";
import type { Employee } from "../../schemas/model";

interface EmployeeRestoreProps {
	employee: Employee;
	state: OverlayState;
	onSuccess?: () => void;
}

export const EmployeeRestore = ({
	employee,
	state,
	onSuccess,
}: EmployeeRestoreProps) => {
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

	return (
		<ConfirmDialog
			title="Restaurar funcionário"
			description={`Deseja restaurar?`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Restaurar"
			cancelButtonLabel="Cancelar"
			isPending={mutation.isPending}
			state={state}
		/>
	);
};
