import { EntityDeleteConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { usePersonDelete } from "../../hooks/use-delete";

interface PersonDeleteProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const PersonDelete = ({ id, state, onSuccess }: PersonDeleteProps) => {
	const { handleConfirm, isPending } = usePersonDelete({ onSuccess });

	return (
		<EntityDeleteConfirm
			title="Excluir pessoa"
			description="Tem certeza que deseja excluir?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
