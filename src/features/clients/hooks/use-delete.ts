import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { deleteClientOptions } from "../api/delete";
import { CLIENT_DATA_CACHE_KEY } from "../constants";
import type { Client } from "../schemas/model";

interface UseClientDeleteOptions {
	client: Client;
	onSuccess?: () => void;
}

export function useClientDelete({ client, onSuccess }: UseClientDeleteOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteClientOptions());

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ data: { id: client.id } });
			toast.success("Cliente excluído com sucesso.");
			await refreshEntityQueries(queryClient, CLIENT_DATA_CACHE_KEY);
			onSuccess?.();
		} catch (error) {
			toast.danger(getMutationErrorMessage(error));
		}
	};

	return { handleConfirm, isPending: mutation.isPending };
}
