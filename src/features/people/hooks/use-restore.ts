import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { restorePersonMutationOptions } from "../api/mutations";
import { personKeys } from "../api/queries";

interface UsePersonRestoreOptions {
	onSuccess?: () => void;
}

export function usePersonRestore({ onSuccess }: UsePersonRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restorePersonMutationOptions());

	const handleConfirm = async (id: EntityId) => {
		try {
			await mutation.mutateAsync({ data: { id } });
			toast.success("Pessoa restaurada com sucesso.");
			await refreshAuditedEntityQueries(queryClient, personKeys.all);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
