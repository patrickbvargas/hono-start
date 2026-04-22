import { useSuspenseQuery } from "@tanstack/react-query";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { getEmployeeByIdQueryOptions } from "../../api/queries";
import { useEmployeeDelete } from "../../hooks/use-delete";

interface EmployeeDeleteProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const EmployeeDelete = ({
	id,
	state,
	onSuccess,
}: EmployeeDeleteProps) => {
	const { data } = useSuspenseQuery(getEmployeeByIdQueryOptions(id));
	const { handleConfirm, isPending } = useEmployeeDelete({ onSuccess });

	return (
		<ConfirmDialog
			title="Excluir funcionário"
			description={`Tem certeza que deseja excluir ${data.fullName}?`}
			onConfirm={() => handleConfirm(id)}
			confirmButtonLabel="Excluir"
			variant="destructive"
			isPending={isPending}
			state={state}
		/>
	);
};
