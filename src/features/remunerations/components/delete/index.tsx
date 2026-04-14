import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemunerationDelete } from "../../hooks/use-delete";
import type { Remuneration } from "../../schemas/model";

interface RemunerationDeleteProps {
	remuneration: Remuneration;
	state: OverlayState;
	onSuccess?: () => void;
}

export const RemunerationDelete = ({
	remuneration,
	state,
	onSuccess,
}: RemunerationDeleteProps) => {
	const { handleConfirm, isPending } = useRemunerationDelete({
		remuneration,
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Excluir remuneração"
			description={`Tem certeza que deseja excluir a remuneração do contrato ${remuneration.contractProcessNumber}?`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Excluir"
			variant="danger"
			isPending={isPending}
			state={state}
		/>
	);
};
