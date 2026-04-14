import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemunerationRestore } from "../../hooks/use-restore";
import type { Remuneration } from "../../schemas/model";

interface RemunerationRestoreProps {
	remuneration: Remuneration;
	state: OverlayState;
	onSuccess?: () => void;
}

export const RemunerationRestore = ({
	remuneration,
	state,
	onSuccess,
}: RemunerationRestoreProps) => {
	const { handleConfirm, isPending } = useRemunerationRestore({
		remuneration,
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Restaurar remuneração"
			description={`Tem certeza que deseja restaurar a remuneração do contrato ${remuneration.contractProcessNumber}?`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Restaurar"
			isPending={isPending}
			state={state}
		/>
	);
};
