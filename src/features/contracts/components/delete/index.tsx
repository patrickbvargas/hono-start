import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";
import { useContractDelete } from "../../hooks/use-delete";
import type { Contract } from "../../schemas/model";

interface ContractDeleteProps {
	contract: Contract;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ContractDelete = ({
	contract,
	state,
	onSuccess,
}: ContractDeleteProps) => {
	const { handleConfirm, isPending } = useContractDelete({
		contract,
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Excluir contrato"
			description={`Tem certeza que deseja excluir o contrato ${contract.processNumber}?`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Excluir"
			variant="danger"
			isPending={isPending}
			state={state}
		/>
	);
};
