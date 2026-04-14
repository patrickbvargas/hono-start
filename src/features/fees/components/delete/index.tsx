import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";
import { useFeeDelete } from "../../hooks/use-delete";
import type { Fee } from "../../schemas/model";

interface FeeDeleteProps {
	fee: Fee;
	state: OverlayState;
	onSuccess?: () => void;
}

export const FeeDelete = ({ fee, state, onSuccess }: FeeDeleteProps) => {
	const { handleConfirm, isPending } = useFeeDelete({
		fee,
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Excluir honorário"
			description={`Tem certeza que deseja excluir o honorário do contrato ${fee.contractProcessNumber}?`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Excluir"
			variant="danger"
			isPending={isPending}
			state={state}
		/>
	);
};
