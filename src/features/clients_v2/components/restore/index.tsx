import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";
import { useClientRestore } from "../../hooks/use-restore";
import type { Client } from "../../schemas/model";

interface ClientRestoreProps {
	client: Client;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ClientRestore = ({
	client,
	state,
	onSuccess,
}: ClientRestoreProps) => {
	const { handleConfirm, isPending } = useClientRestore({
		client,
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Restaurar cliente"
			description={`Tem certeza que deseja restaurar ${client.fullName}?`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Restaurar"
			isPending={isPending}
			state={state}
		/>
	);
};
