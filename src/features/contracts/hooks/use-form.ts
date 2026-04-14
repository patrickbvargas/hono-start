import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { createContractOptions } from "../api/create";
import { updateContractOptions } from "../api/update";
import { CONTRACT_DATA_CACHE_KEY } from "../constants";
import type { ContractUpdateInput } from "../schemas/form";
import {
	contractCreateInputSchema,
	contractUpdateInputSchema,
} from "../schemas/form";
import { defaultContractCreateValues } from "../utils/default";

interface UseContractFormOptions {
	initialData?: ContractUpdateInput;
	onSuccess?: () => void;
}

export function useContractForm({
	initialData,
	onSuccess,
}: UseContractFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createContractOptions());
	const updateMutation = useMutation(updateContractOptions());

	const isEditing = !!initialData;

	const form = useAppForm({
		defaultValues: initialData ?? defaultContractCreateValues(),
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

	return { form };
}
