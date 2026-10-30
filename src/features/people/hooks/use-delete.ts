import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { deletePersonMutationOptions } from "../api/mutations";
import { personKeys } from "../api/queries";

interface UsePersonDeleteOptions {
	onSuccess?: () => void;
}

export function usePersonDelete({ onSuccess }: UsePersonDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deletePersonMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Pessoa excluída com sucesso.");
			await refreshAuditedEntityQueries(queryClient, personKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
