import { EntityDeleteConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemunerationDelete } from "../../hooks/use-delete";

interface RemunerationDeleteProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const RemunerationDelete = ({
	id,
	state,
	onSuccess,
}: RemunerationDeleteProps) => {
	const { handleConfirm, isPending } = useRemunerationDelete({
		onSuccess,
	});

	return (
		<EntityDeleteConfirm
			title="Excluir remuneração"
			description="Tem certeza que deseja excluir?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
