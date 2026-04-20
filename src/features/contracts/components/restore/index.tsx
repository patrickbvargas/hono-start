import { useSuspenseQuery } from "@tanstack/react-query";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { getContractByIdQueryOptions } from "../../api/queries";
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
	const { data } = useSuspenseQuery(getContractByIdQueryOptions(id));
	const { handleConfirm, isPending } = useContractRestore({ onSuccess });

	return (
		<ConfirmDialog
			title="Restaurar contrato"
			description={`Tem certeza que deseja restaurar o contrato ${data.processNumber}?`}
			onConfirm={() => handleConfirm(id)}
			confirmButtonLabel="Restaurar"
			isPending={isPending}
			state={state}
		/>
	);
};
