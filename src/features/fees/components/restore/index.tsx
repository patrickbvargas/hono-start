import { EntityRestoreConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useFeeRestore } from "../../hooks/use-restore";

interface FeeRestoreProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const FeeRestore = ({ id, state, onSuccess }: FeeRestoreProps) => {
	const { handleConfirm, isPending } = useFeeRestore({
		onSuccess,
	});

	return (
		<EntityRestoreConfirm
			title="Restaurar honorário"
			description="Tem certeza que deseja restaurar?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
