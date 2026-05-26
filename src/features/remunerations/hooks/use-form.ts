import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import { updateRemunerationMutationOptions } from "../api/mutations";
import { remunerationKeys } from "../api/queries";
import { remunerationUpdateInputSchema } from "../schemas/form";
import type { Remuneration } from "../schemas/model";

interface UseRemunerationFormOptions {
	id: EntityId;
	initialValue?: Remuneration;
	onSuccess?: () => void;
}

export function useRemunerationForm({
	id,
	initialValue,
	onSuccess,
}: UseRemunerationFormOptions) {
	const queryClient = useQueryClient();
	const updateMutation = useMutation(updateRemunerationMutationOptions());
	const defaultValues = initialValue
		? {
				id: initialValue.id,
				amount: initialValue.amount,
				effectivePercentage: initialValue.effectivePercentage,
			}
		: {
				id,
				amount: 0,
				effectivePercentage: 0,
			};

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: remunerationUpdateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsed = remunerationUpdateInputSchema.parse(value);
				await updateMutation.mutateAsync({ data: parsed });
				toast.success("Remuneração atualizada com sucesso.");
				await refreshAuditedEntityQueries(queryClient, remunerationKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return { form };
}
