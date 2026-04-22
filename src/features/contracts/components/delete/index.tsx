import { useSuspenseQuery } from "@tanstack/react-query";
import { EntityDeleteConfirm } from "@/shared/components/entity-confirmation";
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
		<EntityDeleteConfirm
			title="Excluir contrato"
			description={`Tem certeza que deseja excluir o contrato ${data.processNumber}?`}
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
