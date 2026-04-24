import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deleteClientMutationOptions } from "../api/mutations";
import { clientKeys } from "../api/queries";

interface UseClientDeleteOptions {
	onSuccess?: () => void;
}

export function useClientDelete({ onSuccess }: UseClientDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteClientMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Cliente excluído com sucesso.");
			await refreshEntityQueries(queryClient, clientKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
