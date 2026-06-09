import { EntityDeleteConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useExpenseDelete } from "../../hooks/use-delete";

interface ExpenseDeleteProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ExpenseDelete = ({ id, state, onSuccess }: ExpenseDeleteProps) => {
	const { handleConfirm, isPending } = useExpenseDelete({ onSuccess });

	return (
		<EntityDeleteConfirm
			title="Excluir despesa"
			description="Tem certeza que deseja excluir?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
