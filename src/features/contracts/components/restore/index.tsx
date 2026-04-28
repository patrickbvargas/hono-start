import { EntityRestoreConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useContract } from "../../hooks/use-data";
import { useContractRestore } from "../../hooks/use-restore";

interface ContractRestoreProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ContractRestore = ({
	id,
	state,
	onSuccess,
}: ContractRestoreProps) => {
	const { contract } = useContract(id);
	const { handleConfirm, isPending } = useContractRestore({ onSuccess });

	return (
		<EntityRestoreConfirm
			title="Restaurar contrato"
			description={`Tem certeza que deseja restaurar o contrato ${contract.processNumber}?`}
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
