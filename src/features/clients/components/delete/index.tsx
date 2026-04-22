import { ConfirmDialog } from "@/shared/components/confirm-dialog";
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
		<ConfirmDialog
			title="Excluir cliente"
			description="Tem certeza que deseja excluir?"
			onConfirm={() => handleConfirm(id)}
			confirmButtonLabel="Excluir"
			variant="destructive"
			isPending={isPending}
			state={state}
		/>
	);
};
