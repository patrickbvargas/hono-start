import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { createFeeOptions } from "../api/create";
import { updateFeeOptions } from "../api/update";
import { FEE_DATA_CACHE_KEY } from "../constants";
import {
	type FeeUpdateInput,
	feeCreateInputSchema,
	feeUpdateInputSchema,
} from "../schemas/form";
import { defaultFeeCreateValues } from "../utils/default";

interface UseFeeFormOptions {
	initialData?: FeeUpdateInput;
	onSuccess?: () => void;
}

export function useFeeForm({ initialData, onSuccess }: UseFeeFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createFeeOptions());
	const updateMutation = useMutation(updateFeeOptions());

	const isEditing = !!initialData;

	const form = useAppForm({
		defaultValues: initialData ?? defaultFeeCreateValues(),
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

				await refreshEntityQueries(queryClient, FEE_DATA_CACHE_KEY);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return { form };
}
