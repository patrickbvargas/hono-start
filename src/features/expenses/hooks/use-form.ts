import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getMutationErrorMessage } from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import {
	createExpenseMutationOptions,
	updateExpenseMutationOptions,
} from "../api/mutations";
import { expenseKeys } from "../api/queries";
import {
	expenseCreateInputSchema,
	expenseUpdateInputSchema,
} from "../schemas/form";
import type { ExpenseDetail } from "../schemas/model";
import {
	defaultExpenseCreateValues,
	defaultExpenseUpdateValues,
} from "../utils/default";

interface UseExpenseFormOptions {
	id?: EntityId;
	initialValue?: ExpenseDetail;
	onSuccess?: () => void;
}

export function useExpenseForm({
	id,
	initialValue,
	onSuccess,
}: UseExpenseFormOptions) {
	const queryClient = useQueryClient();
	const createMutation = useMutation(createExpenseMutationOptions());
	const updateMutation = useMutation(updateExpenseMutationOptions());

	const isEditing = Boolean(id);
	const defaultValues =
		isEditing && initialValue
			? defaultExpenseUpdateValues(initialValue)
			: defaultExpenseCreateValues();

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: isEditing ? expenseUpdateInputSchema : expenseCreateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isEditing) {
					const parsed = expenseUpdateInputSchema.parse(value);
					await updateMutation.mutateAsync({ data: parsed });
					toast.success("Despesa atualizada com sucesso.");
				} else {
					const parsed = expenseCreateInputSchema.parse(value);
					await createMutation.mutateAsync({ data: parsed });
					toast.success("Despesa criada com sucesso.");
				}

				await refreshAuditedEntityQueries(queryClient, expenseKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return { form };
}
