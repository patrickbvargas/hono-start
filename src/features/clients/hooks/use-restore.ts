import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { restoreClientOptions } from "../api/restore";
import { CLIENT_DATA_CACHE_KEY } from "../constants";
import type { Client } from "../schemas/model";

interface UseClientRestoreOptions {
	client: Client;
	onSuccess?: () => void;
}

export function useClientRestore({
	client,
	onSuccess,
}: UseClientRestoreOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(restoreClientOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id: client.id } });
			toast.success("Cliente restaurado com sucesso.");
			await refreshEntityQueries(queryClient, CLIENT_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
