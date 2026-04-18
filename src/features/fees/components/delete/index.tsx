import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useFeeDelete } from "../../hooks/use-delete";

interface FeeDeleteProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const FeeDelete = ({ id, state, onSuccess }: FeeDeleteProps) => {
	const { handleConfirm, isPending } = useFeeDelete({
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Excluir honorário"
			description="Tem certeza que deseja excluir?"
			onConfirm={() => handleConfirm(id)}
			confirmButtonLabel="Excluir"
			variant="danger"
			isPending={isPending}
			state={state}
		/>
	);
};
