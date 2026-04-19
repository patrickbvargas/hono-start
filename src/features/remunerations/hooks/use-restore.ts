import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { restoreRemunerationMutationOptions } from "../api/mutations";
import { REMUNERATION_DATA_CACHE_KEY } from "../constants/cache";

interface UseRemunerationRestoreOptions {
	onSuccess?: () => void;
}

export function useRemunerationRestore({
	onSuccess,
}: UseRemunerationRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreRemunerationMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Remuneração restaurada com sucesso.");
			await refreshEntityQueries(queryClient, REMUNERATION_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
