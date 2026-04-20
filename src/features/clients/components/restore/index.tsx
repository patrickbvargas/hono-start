import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useClientRestore } from "../../hooks/use-restore";

interface ClientRestoreProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ClientRestore = ({ id, state, onSuccess }: ClientRestoreProps) => {
	const { handleConfirm, isPending } = useClientRestore({ onSuccess });

	return (
		<ConfirmDialog
			title="Restaurar cliente"
			description="Tem certeza que deseja restaurar?"
			onConfirm={() => handleConfirm(id)}
			confirmButtonLabel="Restaurar"
			isPending={isPending}
			state={state}
		/>
	);
};
