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
import type { ClientUpdate } from "../schemas/form";
import { clientCreateSchema, clientUpdateSchema } from "../schemas/form";
import { defaultClientCreateValues } from "../utils/default";

interface UseClientFormOptions {
	initialData?: ClientUpdate;
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
			onSubmit: isEditing ? clientUpdateSchema : clientCreateSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isEditing) {
					const parsed = clientUpdateSchema.parse(value);
					await updateMutation.mutateAsync({ data: parsed });
					toast.success("Cliente atualizado com sucesso.");
				} else {
					const parsed = clientCreateSchema.parse(value);
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
