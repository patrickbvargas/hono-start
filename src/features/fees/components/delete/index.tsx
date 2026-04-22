import { EntityDeleteConfirm } from "@/shared/components/entity-confirmation";
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
		<EntityDeleteConfirm
			title="Excluir honorário"
			description="Tem certeza que deseja excluir?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
