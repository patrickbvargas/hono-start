import { EntityDeleteConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
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
	const { handleConfirm, isPending } = useEmployeeDelete({ onSuccess });
	return (
		<EntityDeleteConfirm
			title="Excluir colaborador"
			description="Tem certeza que deseja excluir?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
