import { useSuspenseQuery } from "@tanstack/react-query";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { getContractByIdQueryOptions } from "../../api/queries";
import { useContractDelete } from "../../hooks/use-delete";

interface ContractDeleteProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ContractDelete = ({
	id,
	state,
	onSuccess,
}: ContractDeleteProps) => {
	const { data } = useSuspenseQuery(getContractByIdQueryOptions(id));
	const { handleConfirm, isPending } = useContractDelete({ onSuccess });

	return (
		<ConfirmDialog
			title="Excluir contrato"
			description={`Tem certeza que deseja excluir o contrato ${data.processNumber}?`}
			onConfirm={() => handleConfirm(id)}
			confirmButtonLabel="Excluir"
			variant="destructive"
			isPending={isPending}
			state={state}
		/>
	);
};
