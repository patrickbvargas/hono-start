import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployeeRestore } from "../../hooks/use-restore";
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
	const { handleConfirm, isPending } = useEmployeeRestore({
		employee,
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Restaurar funcionário"
			description={`Tem certeza que deseja restaurar ${employee.fullName}?`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Restaurar"
			cancelButtonLabel="Cancelar"
			isPending={isPending}
			state={state}
		/>
	);
};
