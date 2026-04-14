import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { restoreRemunerationOptions } from "../api/restore";
import { REMUNERATION_DATA_CACHE_KEY } from "../constants";
import type { Remuneration } from "../schemas/model";

interface UseRemunerationRestoreOptions {
	remuneration: Remuneration;
	onSuccess?: () => void;
}

export function useRemunerationRestore({
	remuneration,
	onSuccess,
}: UseRemunerationRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreRemunerationOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id: remuneration.id } });
			toast.success("Remuneração restaurada com sucesso.");
			await refreshEntityQueries(queryClient, REMUNERATION_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
