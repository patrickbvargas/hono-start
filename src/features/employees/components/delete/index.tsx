import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployeeDelete } from "../../hooks/use-delete";
import type { Employee } from "../../schemas/model";

interface EmployeeDeleteProps {
	employee: Employee;
	state: OverlayState;
	onSuccess?: () => void;
}

export const EmployeeDelete = ({
	employee,
	state,
	onSuccess,
}: EmployeeDeleteProps) => {
	const { handleConfirm, isPending } = useEmployeeDelete({
		employee,
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Excluir funcionário"
			description={`Tem certeza que deseja excluir ${employee.fullName}? Esta ação pode ser desfeita restaurando o funcionário.`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Excluir"
			variant="danger"
			isPending={isPending}
			state={state}
		/>
	);
};
