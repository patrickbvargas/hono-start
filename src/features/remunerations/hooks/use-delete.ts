import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { deleteRemunerationOptions } from "../api/delete";
import { REMUNERATION_DATA_CACHE_KEY } from "../constants";
import type { Remuneration } from "../schemas/model";

interface UseRemunerationDeleteOptions {
	remuneration: Remuneration;
	onSuccess?: () => void;
}

export function useRemunerationDelete({
	remuneration,
	onSuccess,
}: UseRemunerationDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteRemunerationOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id: remuneration.id } });
			toast.success("Remuneração excluída com sucesso.");
			await refreshEntityQueries(queryClient, REMUNERATION_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
