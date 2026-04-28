import { EntityRestoreConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployee } from "../../hooks/use-data";
import { useEmployeeRestore } from "../../hooks/use-restore";

interface EmployeeRestoreProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const EmployeeRestore = ({
	id,
	state,
	onSuccess,
}: EmployeeRestoreProps) => {
	const { employee } = useEmployee(id);
	const { handleConfirm, isPending } = useEmployeeRestore({ onSuccess });

	return (
		<EntityRestoreConfirm
			title="Restaurar funcionário"
			description={`Tem certeza que deseja restaurar ${employee.fullName}?`}
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
