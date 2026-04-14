import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";
import { useFeeRestore } from "../../hooks/use-restore";
import type { Fee } from "../../schemas/model";

interface FeeRestoreProps {
	fee: Fee;
	state: OverlayState;
	onSuccess?: () => void;
}

export const FeeRestore = ({ fee, state, onSuccess }: FeeRestoreProps) => {
	const { handleConfirm, isPending } = useFeeRestore({
		fee,
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Restaurar honorário"
			description={`Tem certeza que deseja restaurar o honorário do contrato ${fee.contractProcessNumber}?`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Restaurar"
			isPending={isPending}
			state={state}
		/>
	);
};
