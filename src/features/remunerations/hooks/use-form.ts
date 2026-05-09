import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
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

	const form = useAppForm({
		defaultValues: {
			id: initialValue?.id ?? id,
			amount: initialValue?.amount ?? 0,
			effectivePercentage: initialValue?.effectivePercentage ?? 0,
		},
		validators: {
			onSubmit: remunerationUpdateInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsed = remunerationUpdateInputSchema.parse(value);
				await updateMutation.mutateAsync({ data: parsed });
				toast.success("Remuneração atualizada com sucesso.");
				await refreshEntityQueries(queryClient, remunerationKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	React.useEffect(() => {
		if (initialValue) {
			form.reset({
				id: initialValue.id,
				amount: initialValue.amount,
				effectivePercentage: initialValue.effectivePercentage,
			});
		}
	}, [form, initialValue]);

	return { form };
}
