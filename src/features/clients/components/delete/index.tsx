import { EntityDeleteConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useClientDelete } from "../../hooks/use-delete";

interface ClientDeleteProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ClientDelete = ({ id, state, onSuccess }: ClientDeleteProps) => {
	const { handleConfirm, isPending } = useClientDelete({ onSuccess });

	return (
		<EntityDeleteConfirm
			title="Excluir cliente"
			description="Tem certeza que deseja excluir?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
