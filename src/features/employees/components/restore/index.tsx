import { useSuspenseQuery } from "@tanstack/react-query";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { getEmployeeByIdQueryOptions } from "../../api/queries";
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
	const { data } = useSuspenseQuery(getEmployeeByIdQueryOptions(id));
	const { handleConfirm, isPending } = useEmployeeRestore({ onSuccess });

	return (
		<ConfirmDialog
			title="Restaurar funcionário"
			description={`Tem certeza que deseja restaurar ${data.fullName}?`}
			onConfirm={() => handleConfirm(id)}
			confirmButtonLabel="Restaurar"
			isPending={isPending}
			state={state}
		/>
	);
};
