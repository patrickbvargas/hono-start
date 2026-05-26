import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import {
	createContractMutationOptions,
	updateContractMutationOptions,
} from "../api/mutations";
import { contractKeys } from "../api/queries";
import {
	contractCreateInputSchema,
	contractUpdateInputSchema,
} from "../schemas/form";
import type { ContractDetail } from "../schemas/model";
import {
	defaultContractCreateValues,
	defaultContractUpdateValues,
} from "../utils/default";

interface UseContractFormOptions {
	id?: EntityId;
	initialValue?: ContractDetail;
	onSuccess?: () => void;
}

export function useContractForm({
	id,
	initialValue,
	onSuccess,
}: UseContractFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createContractMutationOptions());
	const updateMutation = useMutation(updateContractMutationOptions());

	const isEditing = !!id;
	const defaultValues =
		isEditing && initialValue
			? defaultContractUpdateValues(initialValue)
			: defaultContractCreateValues();

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: isEditing
				? contractUpdateInputSchema
				: contractCreateInputSchema,
		},
		onSubmitInvalid: () => {
			toast.danger("Revise os campos obrigatórios do contrato.");
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
				await refreshAuditedEntityQueries(queryClient, contractKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return { form };
}
