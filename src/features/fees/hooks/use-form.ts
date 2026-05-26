import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import {
	createFeeMutationOptions,
	updateFeeMutationOptions,
} from "../api/mutations";
import { feeKeys } from "../api/queries";
import { feeCreateInputSchema, feeUpdateInputSchema } from "../schemas/form";
import type { FeeDetail } from "../schemas/model";
import {
	defaultFeeCreateValues,
	defaultFeeUpdateValues,
} from "../utils/default";

interface UseFeeFormOptions {
	id?: EntityId;
	initialValue?: FeeDetail;
	onSuccess?: () => void;
}

export function useFeeForm({ id, initialValue, onSuccess }: UseFeeFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createFeeMutationOptions());
	const updateMutation = useMutation(updateFeeMutationOptions());

	const isEditing = !!id;
	const defaultValues =
		isEditing && initialValue
			? defaultFeeUpdateValues(initialValue)
			: defaultFeeCreateValues();

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: isEditing ? feeUpdateInputSchema : feeCreateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isEditing) {
					const parsed = feeUpdateInputSchema.parse(value);
					await updateMutation.mutateAsync({ data: parsed });
					toast.success("Honorário atualizado com sucesso.");
				} else {
					const parsed = feeCreateInputSchema.parse(value);
					await createMutation.mutateAsync({ data: parsed });
					toast.success("Honorário criado com sucesso.");
				}

				await refreshAuditedEntityQueries(queryClient, feeKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return { form };
}
