import { EntityRestoreConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { usePersonRestore } from "../../hooks/use-restore";

interface PersonRestoreProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const PersonRestore = ({ id, state, onSuccess }: PersonRestoreProps) => {
	const { handleConfirm, isPending } = usePersonRestore({ onSuccess });

	return (
		<EntityRestoreConfirm
			title="Restaurar pessoa"
			description="Tem certeza que deseja restaurar?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
