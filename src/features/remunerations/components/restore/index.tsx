import { ConfirmDialog } from "@/shared/components/confirm-dialog";
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
		<ConfirmDialog
			title="Restaurar remuneração"
			description="Tem certeza que deseja restaurar?"
			onConfirm={() => handleConfirm(id)}
			confirmButtonLabel="Restaurar"
			isPending={isPending}
			state={state}
		/>
	);
};
