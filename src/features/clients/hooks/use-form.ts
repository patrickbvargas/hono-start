import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import {
	createClientMutationOptions,
	updateClientMutationOptions,
} from "../api/mutations";
import { getClientByIdQueryOptions } from "../api/queries";
import { CLIENT_DATA_CACHE_KEY } from "../constants/cache";
import {
	clientCreateInputSchema,
	clientUpdateInputSchema,
} from "../schemas/form";
import {
	defaultClientCreateValues,
	defaultClientUpdateValues,
} from "../utils/default";

interface UseClientFormOptions {
	id?: EntityId;
	onSuccess?: () => void;
}

export function useClientForm({ id, onSuccess }: UseClientFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createClientMutationOptions());
	const updateMutation = useMutation(updateClientMutationOptions());

	const isEditing = !!id;

	const { data } = useQuery({
		...getClientByIdQueryOptions(id ?? 0),
		enabled: isEditing,
	});

	const form = useAppForm({
		defaultValues: defaultClientCreateValues(),
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

	React.useEffect(() => {
		if (isEditing && data) {
			form.reset(defaultClientUpdateValues(data));
		}
	}, [isEditing, data, form]);

	return { form };
}
