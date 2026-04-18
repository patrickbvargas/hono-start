import { ConfirmDialog } from "@/shared/components/confirm-dialog";
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
		<ConfirmDialog
			title="Restaurar honorário"
			description="Tem certeza que deseja restaurar?"
			onConfirm={() => handleConfirm(id)}
			confirmButtonLabel="Restaurar"
			isPending={isPending}
			state={state}
		/>
	);
};
