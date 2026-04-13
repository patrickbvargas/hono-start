import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";
import { useContractRestore } from "../../hooks/use-restore";
import type { Contract } from "../../schemas/model";

interface ContractRestoreProps {
	contract: Contract;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ContractRestore = ({
	contract,
	state,
	onSuccess,
}: ContractRestoreProps) => {
	const { handleConfirm, isPending } = useContractRestore({
		contract,
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Restaurar contrato"
			description={`Tem certeza que deseja restaurar o contrato ${contract.processNumber}?`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Restaurar"
			isPending={isPending}
			state={state}
		/>
	);
};
