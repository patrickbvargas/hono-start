import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";

interface EntityConfirmationProps {
	state: OverlayState;
	title: string;
	description: string;
	onConfirm: () => void;
	isPending?: boolean;
}

export const EntityDeleteConfirm = ({
	state,
	title,
	description,
	onConfirm,
	isPending = false,
}: EntityConfirmationProps) => {
	return (
		<ConfirmDialog
			title={title}
			description={description}
			onConfirm={onConfirm}
			confirmButtonLabel="Excluir"
			variant="destructive"
			isPending={isPending}
			state={state}
		/>
	);
};

export const EntityRestoreConfirm = ({
	state,
	title,
	description,
	onConfirm,
	isPending = false,
}: EntityConfirmationProps) => {
	return (
		<ConfirmDialog
			title={title}
			description={description}
			onConfirm={onConfirm}
			confirmButtonLabel="Restaurar"
			isPending={isPending}
			state={state}
		/>
	);
};
