import { EntityRestoreConfirm } from "@/shared/components/entity-confirmation";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useExpenseRestore } from "../../hooks/use-restore";

interface ExpenseRestoreProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ExpenseRestore = ({
	id,
	state,
	onSuccess,
}: ExpenseRestoreProps) => {
	const { handleConfirm, isPending } = useExpenseRestore({ onSuccess });

	return (
		<EntityRestoreConfirm
			title="Restaurar despesa"
			description="Tem certeza que deseja restaurar?"
			onConfirm={() => handleConfirm(id)}
			isPending={isPending}
			state={state}
		/>
	);
};
