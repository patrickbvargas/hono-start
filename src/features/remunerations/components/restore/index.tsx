import { EntityRestoreConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemunerationRestore } from "../../hooks/use-restore";

interface RemunerationRestoreProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const RemunerationRestore = ({
	id,
	state,
	onSuccess,
}: RemunerationRestoreProps) => {
	const { handleConfirm, isPending } = useRemunerationRestore({
		onSuccess,
	});

	return (
		<EntityRestoreConfirm
			title="Restaurar remuneração"
			description="Tem certeza que deseja restaurar?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
