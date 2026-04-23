import { EntityDeleteConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useAttachmentDelete } from "../../hooks/use-delete";

interface AttachmentDeleteProps {
	id: EntityId;
	onSuccess?: () => void;
	state: OverlayState;
}

export const AttachmentDelete = ({
	id,
	onSuccess,
	state,
}: AttachmentDeleteProps) => {
	const { handleConfirm, isPending } = useAttachmentDelete({ onSuccess });

	return (
		<EntityDeleteConfirm
			title="Excluir anexo"
			description="Tem certeza que deseja excluir este anexo?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
