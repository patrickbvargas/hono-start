import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { createClientOptions } from "../api/create";
import { updateClientOptions } from "../api/update";
import { CLIENT_DATA_CACHE_KEY } from "../constants";
import type {
	ClientCreateFormInput,
	ClientUpdateFormInput,
} from "../schemas/form";
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
					clientUpdateInputSchema.parse(value);
					await updateMutation.mutateAsync({
						data: value as ClientUpdateFormInput,
					});
					toast.success("Cliente atualizado com sucesso.");
				} else {
					clientCreateInputSchema.parse(value);
					await createMutation.mutateAsync({
						data: value as ClientCreateFormInput,
					});
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
