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
	createContractMutationOptions,
	updateContractMutationOptions,
} from "../api/mutations";
import { getContractByIdQueryOptions } from "../api/queries";
import { CONTRACT_DATA_CACHE_KEY } from "../constants/cache";
import {
	contractCreateInputSchema,
	contractUpdateInputSchema,
} from "../schemas/form";
import {
	defaultContractCreateValues,
	defaultContractUpdateValues,
} from "../utils/default";

interface UseContractFormOptions {
	id?: EntityId;
	onSuccess?: () => void;
}

export function useContractForm({ id, onSuccess }: UseContractFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createContractMutationOptions());
	const updateMutation = useMutation(updateContractMutationOptions());

	const isEditing = !!id;
	const { data } = useQuery({
		...getContractByIdQueryOptions(id ?? 0),
		enabled: isEditing,
	});

	const form = useAppForm({
		defaultValues: defaultContractCreateValues(),
		validators: {
			onSubmit: isEditing
				? contractUpdateInputSchema
				: contractCreateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isEditing) {
					const parsed = contractUpdateInputSchema.parse(value);
					await updateMutation.mutateAsync({ data: parsed });
					toast.success("Contrato atualizado com sucesso.");
				} else {
					const parsed = contractCreateInputSchema.parse(value);
					await createMutation.mutateAsync({ data: parsed });
					toast.success("Contrato criado com sucesso.");
				}
				await refreshEntityQueries(queryClient, CONTRACT_DATA_CACHE_KEY);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	React.useEffect(() => {
		if (isEditing && data) {
			form.reset(defaultContractUpdateValues(data));
		}
	}, [data, form, isEditing]);

	return { form };
}
