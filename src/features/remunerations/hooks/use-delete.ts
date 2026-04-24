import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deleteRemunerationMutationOptions } from "../api/mutations";
import { remunerationKeys } from "../api/queries";

interface UseRemunerationDeleteOptions {
	onSuccess?: () => void;
}

export function useRemunerationDelete({
	onSuccess,
}: UseRemunerationDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteRemunerationMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Remuneração excluída com sucesso.");
			await refreshEntityQueries(queryClient, remunerationKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
