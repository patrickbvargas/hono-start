import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { createClientOptions, updateClientOptions } from "../api/mutations";
import { CLIENT_DATA_CACHE_KEY } from "../constants/cache";
import type { ClientUpdateFormInput } from "../schemas/form";
import {
	clientCreateInputSchema,
	clientUpdateInputSchema,
} from "../schemas/form";
import { defaultClientCreateValues } from "../utils/default";

interface UseClientFormOptions {
	initialData?: ClientUpdateFormInput;
	onSuccess?: () => void;
}

export function useClientForm({
	initialData,
	onSuccess,
}: UseClientFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createClientOptions());
	const updateMutation = useMutation(updateClientOptions());

	const isEditing = !!initialData;

	const form = useAppForm({
		defaultValues: initialData ?? defaultClientCreateValues(),
		validators: {
			onSubmit: isEditing ? clientUpdateInputSchema : clientCreateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isEditing) {
					const parsed = clientUpdateInputSchema.parse(value);
					await updateMutation.mutateAsync({ data: parsed });
					toast.success("Cliente atualizado com sucesso.");
				} else {
					const parsed = clientCreateInputSchema.parse(value);
					await createMutation.mutateAsync({ data: parsed });
					toast.success("Cliente criado com sucesso.");
				}
				await refreshEntityQueries(queryClient, CLIENT_DATA_CACHE_KEY);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return { form };
}
