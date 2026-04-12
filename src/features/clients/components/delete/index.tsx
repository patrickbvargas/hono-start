import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import type { OverlayState } from "@/shared/types/overlay";
import { useClientDelete } from "../../hooks/use-delete";
import type { Client } from "../../schemas/model";

interface ClientDeleteProps {
	client: Client;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ClientDelete = ({
	client,
	state,
	onSuccess,
}: ClientDeleteProps) => {
	const { handleConfirm, isPending } = useClientDelete({
		client,
		onSuccess,
	});

	return (
		<ConfirmDialog
			title="Excluir cliente"
			description={`Tem certeza que deseja excluir ${client.fullName}?`}
			onConfirm={handleConfirm}
			confirmButtonLabel="Excluir"
			variant="danger"
			isPending={isPending}
			state={state}
		/>
	);
};
