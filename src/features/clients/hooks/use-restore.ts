import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { restoreClientMutationOptions } from "../api/mutations";
import { clientKeys } from "../api/queries";

interface UseClientRestoreOptions {
	onSuccess?: () => void;
}

export function useClientRestore({ onSuccess }: UseClientRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreClientMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Cliente restaurado com sucesso.");
			await refreshEntityQueries(queryClient, clientKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
